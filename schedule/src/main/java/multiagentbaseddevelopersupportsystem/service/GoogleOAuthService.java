package multiagentbaseddevelopersupportsystem.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import multiagentbaseddevelopersupportsystem.domain.GoogleCredential;
import multiagentbaseddevelopersupportsystem.domain.GoogleCredentialRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final GoogleCredentialRepository repo;
    private final RestTemplate restTemplate;
    private final ObjectMapper om = new ObjectMapper();

    @Value("${google.oauth.client-id}")     private String clientId;
    @Value("${google.oauth.client-secret}") private String clientSecret;
    @Value("${google.oauth.redirect-uri}")  private String redirectUri;
    @Value("#{'${google.oauth.scopes}'.split(',')}") private List<String> scopes;   // YAML 리스트를 List<String>으로 주입받음

    private static final String AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";

    /**
     * 프론트 팝업에서 열 URL 생성 (state에 returnTo 등 인코딩)
     * @param state 사용자 식별자 및 리다이렉트 경로를 포함
     * @return 인증 URL
     */
    public String buildAuthUrl(String state) {
        String scope = scopes.stream()
                        .map(String::trim)
                        .collect(Collectors.joining(" "));
        String encodedScope = URLEncoder.encode(scope, StandardCharsets.UTF_8);

        String googleAuthURL = AUTH_URL +
                "?response_type=code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&scope=" + encodedScope +
                "&access_type=offline" +
                "&prompt=consent" +
                "&include_granted_scopes=true" +
                "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);
        log.info("인증 URL : " + googleAuthURL);

        return googleAuthURL;
    }

    /**
     * 토큰을 교환하고 GoogleCredential에 저장
     * @param email 사용자 이메일 (userId 대신 사용)
     * @param code 인증 코드
     */
    public void exchangeCodeAndStore(String code) {
        Map<String, String> form = new LinkedHashMap<>();
        form.put("code", code);
        form.put("client_id", clientId);
        form.put("client_secret", clientSecret);
        form.put("redirect_uri", redirectUri);
        form.put("grant_type", "authorization_code");

        JsonNode tokenJson = httpPostForm(TOKEN_URL, form);

        String accessToken = tokenJson.get("access_token").asText();
        long expiresIn = tokenJson.get("expires_in").asLong();

        String refreshToken = tokenJson.has("refresh_token") && !tokenJson.get("refresh_token").isNull()
            ? tokenJson.get("refresh_token").asText()
            : null;

        String idToken = tokenJson.get("id_token").asText();
        String googleEmail = normalizeEmail(parseEmailFromIdToken(idToken));

        // googleEmail 기준 upsert
        GoogleCredential cred = repo.findByGoogleEmail(googleEmail).orElseGet(GoogleCredential::new);
        cred.setGoogleEmail(googleEmail);
        cred.setAccessToken(accessToken);
        cred.setAccessTokenExpiresAt(Instant.now().plusSeconds(expiresIn - 30));

        // refresh_token은 최초에만 올 수 있음 → null이면 기존 값 유지
        if (refreshToken != null && !refreshToken.isBlank()) {
            cred.setRefreshToken(refreshToken);
        } else if (cred.getRefreshToken() == null) {
            throw new RuntimeException("No refresh_token received from Google");
        }

        Instant now = Instant.now();
        if (cred.getId() == null) cred.setCreatedAt(now);
        cred.setUpdatedAt(now);

        repo.save(cred);
    }
    
   /** 액세스 토큰 보장 (만료 시 refresh_token으로 재발급) */
    public String ensureAccessTokenByEmail(String email) {
        log.info("ensureAccessTokenByEmail() key={}", normalizeEmail(email));

        String key = normalizeEmail(email);
        GoogleCredential cred = repo.findByGoogleEmail(key)
            .orElseThrow(() -> new RuntimeException("Google account not linked for: " + key)); // 여기서 오류 발생

        if (cred.getAccessToken() != null &&
            cred.getAccessTokenExpiresAt() != null &&
            Instant.now().isBefore(cred.getAccessTokenExpiresAt())) {
            return cred.getAccessToken();
        }

        Map<String, String> form = new LinkedHashMap<>();
        form.put("client_id", clientId);
        form.put("client_secret", clientSecret);
        form.put("refresh_token", cred.getRefreshToken());
        form.put("grant_type", "refresh_token");

        JsonNode tokenJson = httpPostForm(TOKEN_URL, form);
        String newAccessToken = tokenJson.get("access_token").asText();
        long expiresIn = tokenJson.get("expires_in").asLong();

        cred.setAccessToken(newAccessToken);
        cred.setAccessTokenExpiresAt(Instant.now().plusSeconds(expiresIn - 30));
        cred.setUpdatedAt(Instant.now());
        repo.save(cred);

        return newAccessToken;
    }
    
    /** ================ 유틸 함수 ================ */
    // ---- 공용 HTTP 유틸 ----
    public JsonNode httpGetJson(String url, String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        try {
            return om.readTree(resp.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON: " + e.getMessage(), e);
        }
    }

    public JsonNode httpPostForm(String url, Map<String, String> form) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String body = form.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "=" +
                          URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .reduce((a, b) -> a + "&" + b).orElse("");

        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> resp = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        try {
            return om.readTree(resp.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON: " + e.getMessage(), e);
        }
    }

    /** id_token의 payload에서 email 추출 */
    private String parseEmailFromIdToken(String idToken) {
        try {
            String[] parts = idToken.split("\\.");
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            return om.readTree(payload).get("email").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse id_token email", e);
        }
    }

    // GoogleOAuthService.java
    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    
}