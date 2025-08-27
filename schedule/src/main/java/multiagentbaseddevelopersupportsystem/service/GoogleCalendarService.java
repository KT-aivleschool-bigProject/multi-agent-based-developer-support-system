package multiagentbaseddevelopersupportsystem.service;

import com.fasterxml.jackson.databind.JsonNode;


import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 구글 캘린더 목록/이벤트 조회.
 * - ★ 변경점: userId → googleEmail 기반으로 토큰 확보.
 *   즉, 호출부에서 현재 사용자 서비스 이메일(=연동한 구글 이메일과 동일하다고 가정)을 넘겨야 함.
 */
@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

    private final GoogleOAuthService oauth;

    private static final String CAL_BASE = "https://www.googleapis.com/calendar/v3";

    /** 캘린더 목록 조회 */
    public JsonNode listCalendars(String googleEmail) {
        String accessToken = oauth.ensureAccessTokenByEmail(googleEmail);
        String url = CAL_BASE + "/users/me/calendarList";
        return oauth.httpGetJson(url, accessToken);
    }

    /** 이벤트 조회 */
    public JsonNode listEvents(String googleEmail, String calendarId, Map<String, String> queryParams) {
        String accessToken = oauth.ensureAccessTokenByEmail(googleEmail);

        String qs = queryParams.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "=" +
                          URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        String url = CAL_BASE + "/calendars/" +
                URLEncoder.encode(calendarId, StandardCharsets.UTF_8) +
                "/events" + (qs.isEmpty() ? "" : "?" + qs);
        System.out.println("❤️❤️❤️Google Calendar API 요청: url=" + url + ", accessToken=" + accessToken);
        return oauth.httpGetJson(url, accessToken);
    }

    // whitez 추가

    private final RestTemplate restTemplate = new RestTemplate();

    public JsonNode getEvents(String accessToken, String calendarId) {
        String url = "https://www.googleapis.com/calendar/v3/calendars/" + calendarId + "/events";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            JsonNode.class
        );

        return response.getBody();
    }
}