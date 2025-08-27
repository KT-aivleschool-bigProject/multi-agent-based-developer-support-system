package multiagentbaseddevelopersupportsystem.service;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.UserDto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;

/**
 * 게이트웨이(또는 usermanagement 서비스)로 /users/me 호출해서
 * 현재 로그인한 사용자(UserDto)를 가져옵니다.
 * - Authorization 헤더를 그대로 전달해야 합니다.
 */
@Service
@RequiredArgsConstructor
public class UserClient {

    private final RestTemplate restTemplate;

    @Value("${usermanagement.base-url}")
    private String userServiceBaseUrl; // 예: http://gateway.internal 또는 http://usermanagement:8080

    public UserDto getCurrentUser(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth == null || auth.isBlank()) {
            throw new RuntimeException("Missing Authorization header");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", auth);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<UserDto> resp = restTemplate.exchange(
                userServiceBaseUrl + "/users/me",
                HttpMethod.GET,
                entity,
                UserDto.class
        );
        UserDto body = resp.getBody(); // ✅ 널 안전성
        if (body == null) throw new RuntimeException("User service returned no body");

        return resp.getBody();
    }
}