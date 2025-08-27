package multiagentbaseddevelopersupportsystem.infra;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import multiagentbaseddevelopersupportsystem.domain.GoogleCredentialRepository;
import multiagentbaseddevelopersupportsystem.domain.UserDto;
import multiagentbaseddevelopersupportsystem.service.GoogleCalendarService;
import multiagentbaseddevelopersupportsystem.service.GoogleOAuthService;
import multiagentbaseddevelopersupportsystem.service.UserClient;

import org.springframework.http.*;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 컨트롤러는 얇게 유지:
 * - 현재 사용자: /users/me 호출(UserClient)
 * - OAuth URL/콜백: GoogleOAuthService
 * - 캘린더/이벤트: GoogleCalendarService
 */
@Slf4j
@RestController
@RequestMapping("/schedule/google")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final UserClient userClient;
    private final GoogleOAuthService oauth;
    private final GoogleCalendarService calendarSvc;
    private final GoogleCredentialRepository repo;

    /** 1) 인증 URL 생성 */
    @GetMapping("/auth/url")
    public Map<String, String> authUrl(@RequestParam String returnTo, HttpServletRequest req) {
        // raw email 우선
        String email = extractEmailFromJwt(req);
        if (email == null) {
            // fallback: /users/me (마스킹 가능 → state 용도로만 사용)
            UserDto user = userClient.getCurrentUser(req);
            email = user != null ? user.getEmail() : null;
        }
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }
        String state = email + "|" + returnTo;
        return Map.of("url", oauth.buildAuthUrl(state));
    }

    /** 2) 구글 콜백: code 교환 → 저장 → 팝업 닫는 HTML 반환 */
    @GetMapping("/auth/callback")
    public ResponseEntity<String> callback(@RequestParam String code,
                                        @RequestParam(required = false) String state) {
        log.info("OAuth callback arrived. state={}", state);
        try {
            oauth.exchangeCodeAndStore(code);

            // state에서 returnTo 복원 (형식: "<email>|<returnTo>")
            String returnTo = null;
            if (state != null && state.contains("|")) {
                String[] parts = state.split("\\|", 2);
                if (parts.length == 2) returnTo = parts[1];
            }
            String safeReturnTo = returnTo == null ? "" : HtmlUtils.htmlEscape(returnTo);

            // 메인 탭에 JSON payload로 신호 보냄 + 팝업 닫기
            String ok = "<script>(function(){"
                    + "try{window.opener&&window.opener.postMessage({type:'google-linked',returnTo:'" + safeReturnTo + "'},'*');}catch(e){}"
                    + "setTimeout(function(){window.close();},50);"
                    + "})();</script>"
                    + "<p>연동이 완료되었습니다. 창을 닫아주세요.</p>";

            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(ok);
        } catch (Exception e) {
            String err = "<script>(function(){"
                    + "try{window.opener&&window.opener.postMessage({type:'google-failed'},'*');}catch(e){}"
                    + "})();</script>"
                    + "<pre>" + HtmlUtils.htmlEscape(e.getMessage()) + "</pre>";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_HTML).body(err);
        }
    }

    /** 3) 연결 상태 확인 */
    @GetMapping("/status")
    public Map<String, Object> status(HttpServletRequest req) {
        // 1) JWT에서 원본 이메일 우선 추출
        String email = extractEmailFromJwt(req);

        // 2) JWT에 없으면(혹은 프론트가 아직 로그인 전이면) 기존 /users/me로 시도
        if (email == null) {
            try {
                UserDto user = userClient.getCurrentUser(req);
                email = user != null ? user.getEmail() : null; // 이건 마스킹일 수 있음
            } catch (RestClientResponseException ex) {
                return Map.of("connected", false); // 부드럽게 실패
            }
        }

        if (email == null || email.isBlank()) {
            return Map.of("connected", false);
        }

        boolean linked = repo.findByGoogleEmail(email).isPresent();
        return linked ? Map.of("connected", true, "email", email)
                    : Map.of("connected", false);
    }

    /** 4) 캘린더 목록 */
    
    @GetMapping("/calendars")
    public JsonNode calendars(HttpServletRequest req) {
        log.info("calendars() emailResolved={}", resolveCurrentEmail(req));

        // JWT의 email → 없으면 /users/me 순으로 “진짜 구글 이메일” 확정
        String email = resolveCurrentEmail(req);
        // log.info(calendarSvc.listCalendars(user.getEmail()).toString());
        return calendarSvc.listCalendars(email);
    }

    /** 5) 이벤트 조회 (timeMin, timeMax 등 쿼리 파라미터 그대로 위임) */
    @GetMapping("/events")
    public JsonNode events(
            HttpServletRequest req,
            @RequestParam(defaultValue = "primary") String calendarId,
            @RequestParam Map<String, String> allParams
    ) {
        String email = resolveCurrentEmail(req);
        allParams.remove("calendarId");
        return calendarSvc.listEvents(email, calendarId, allParams); // **수정**: userId 대신 email을 전달
    }

    private String extractEmailFromJwt(HttpServletRequest req) {
        try {
            String auth = req.getHeader("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) return null;
            String token = auth.substring(7);
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String json = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            ObjectMapper om = new ObjectMapper();
            JsonNode node = om.readTree(json);
            if (node.hasNonNull("email")) return node.get("email").asText();
            // 토큰에 email이 없으면 sub를 fallback으로 (토큰 발급처 설계에 따름)
            if (node.hasNonNull("sub")) return node.get("sub").asText();
        } catch (Exception ignore) {}
        return null;
    }

    private String resolveCurrentEmail(HttpServletRequest req) {
        // 1) JWT 토큰에서 email 추출
        String email = extractEmailFromJwt(req);

        // 2) JWT에서 못 뽑았으면 usermanagement 호출
        if (!StringUtils.hasText(email)) {
            try {
                UserDto user = userClient.getCurrentUser(req);
                if (user != null && StringUtils.hasText(user.getEmail())) {
                    email = user.getEmail();
                }
            } catch (RestClientResponseException ex) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
            }
        }

        // 3) 여전히 없으면 인증 실패
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

        // ✅ 정규화 후 반환
        return normalizeEmail(email);
    }

        // GoogleOAuthService.java
    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
