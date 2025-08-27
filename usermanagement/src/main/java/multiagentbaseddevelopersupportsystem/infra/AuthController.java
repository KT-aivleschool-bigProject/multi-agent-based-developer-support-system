package multiagentbaseddevelopersupportsystem.infra;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.service.AuthService;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.annotation.JsonProperty;
import  java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody @Valid SignupCommand command) {
        // 1. reCAPTCHA 검증
        if (command.getRecaptchaToken() == null || command.getRecaptchaToken().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        RestTemplate restTemplate = new RestTemplate();
        String verifyUrl = "https://www.google.com/recaptcha/api/siteverify?secret=6Lc44bQrAAAAAP8k5ye7k6G0eYVmKPdf9pBIiZdH&response=" + command.getRecaptchaToken();
        Map response = restTemplate.postForObject(verifyUrl, null, Map.class);
        if (response == null || !(Boolean) response.get("success")) {
            return ResponseEntity.badRequest().build();
        }

        // 2. 기존 회원가입 로직
        authService.signup(command);
        return ResponseEntity.ok().build(); 
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@RequestBody @Valid LoginCommand command) {
        return ResponseEntity.ok(authService.login(command)); 
    }

    @PostMapping("/reissue")
    public ResponseEntity<TokenResponseDto> reissue(@RequestBody TokenRequestDto tokenRequestDto) {
        return ResponseEntity.ok(authService.reissue(tokenRequestDto));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        authService.logout(token);
        return ResponseEntity.noContent().build();  
    }

    @GetMapping("/guest")
    public ResponseEntity<?> guestLogin() {
        LoginCommand command = new LoginCommand("guest@system.com", "guest1234!");
        return ResponseEntity.ok(authService.login(command));
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody @Valid PasswordRequest passwordRequest) {
        String token = authService.requestPasswordReset(passwordRequest.getEmail());
        // 실제로는 이메일로 토큰을 발송해야 함
        return ResponseEntity.ok(token);
    }

    @PostMapping("/password-reset")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid PasswordResetRequest passwordResetRequest) {
        authService.resetPassword(passwordResetRequest.getToken(), passwordResetRequest.getNewPassword());
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }
}
