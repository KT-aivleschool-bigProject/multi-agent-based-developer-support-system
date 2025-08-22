package multiagentbaseddevelopersupportsystem.infra;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.service.AuthService;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody @Valid SignupCommand command) {
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
    public ResponseEntity<?> requestPasswordReset(@RequestParam String email) {
        String token = authService.requestPasswordReset(email);
        // 실제로는 이메일로 토큰을 발송해야 함
        return ResponseEntity.ok(token);
    }

    @PostMapping("/password-reset")
    public ResponseEntity<?> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }
}
