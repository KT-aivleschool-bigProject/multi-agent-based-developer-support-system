package multiagentbaseddevelopersupportsystem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.event.Signuped;
import multiagentbaseddevelopersupportsystem.exception.BusinessException;
import multiagentbaseddevelopersupportsystem.security.TokenProvider;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private static final long PASSWORD_EXPIRE_DAYS = 90;

    public void signup(SignupCommand command) {
        if (userRepository.existsByEmail(command.getEmail())) {
            throw new BusinessException("이미 사용 중인 이메일입니다.", "DUPLICATE_EMAIL");
        }
        User user = User.toEntity(command, passwordEncoder);
        userRepository.save(user);
        log.info("회원가입 성공: {}", command.getEmail());

        Signuped event = new Signuped(user);
        event.publishAfterCommit();
        log.info("Signuped 이벤트 발행: {}", command.getEmail());
    }

    public TokenResponseDto login(LoginCommand command) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(command.getEmail(), command.getPassword());

        Authentication authentication;
        try {
            authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        } catch (Exception e) {
            throw new BusinessException("이메일 또는 비밀번호가 일치하지 않습니다.", "AUTHENTICATION_FAILED");
        }

        User user = userRepository.findByEmail(command.getEmail())
                .orElseThrow(() -> new BusinessException("존재하지 않는 사용자입니다.", "USER_NOT_FOUND"));

        validatePasswordExpiry(user);

        TokenResponseDto tokenDto = tokenProvider.generateTokenDto(authentication);

        RefreshToken refreshToken = RefreshToken.builder()
                .key(authentication.getName())
                .value(tokenDto.getRefreshToken())
                .build();

        refreshTokenRepository.save(refreshToken);
        log.info("로그인 성공: {}", authentication.getName());

        return tokenDto;
    }

    public TokenResponseDto reissue(TokenRequestDto tokenRequestDto) {
        if (!tokenProvider.validateToken(tokenRequestDto.getRefreshToken())) {
            throw new BusinessException("유효하지 않은 토큰입니다.", "INVALID_REFRESH_TOKEN");
        }

        Authentication authentication = tokenProvider.getAuthentication(tokenRequestDto.getAccessToken());

        RefreshToken refreshToken = refreshTokenRepository.findById(authentication.getName())
                .orElseThrow(() -> new BusinessException("사용자 인증 정보를 찾을 수 없습니다.", "REFRESH_TOKEN_NOT_FOUND"));

        if (!refreshToken.getValue().equals(tokenRequestDto.getRefreshToken())) {
            throw new BusinessException("토큰 정보가 일치하지 않습니다.", "TOKEN_MISMATCH");
        }

        TokenResponseDto tokenDto;
        if (tokenProvider.refreshTokenPeriodCheck(refreshToken.getValue())) {
            tokenDto = tokenProvider.generateTokenDto(authentication);
            RefreshToken newRefreshToken = refreshToken.updateValue(tokenDto.getRefreshToken());
            refreshTokenRepository.save(newRefreshToken);
        } else {
            tokenDto = tokenProvider.createAccessToken(authentication);
        }

        log.info("토큰 재발급 완료: {}", authentication.getName());

        return tokenDto;
    }

    public void logout(String accessToken) {
        Authentication authentication = tokenProvider.getAuthentication(accessToken);
        String key = authentication.getName();

        if (!refreshTokenRepository.existsById(key)) {
            throw new BusinessException("이미 로그아웃된 사용자입니다.", "ALREADY_LOGGED_OUT");
        }

        refreshTokenRepository.deleteById(key);
        log.info("로그아웃 완료: {}", key);
    }

    // 비밀번호 재설정 요청 (토큰 발급)
    public String requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("존재하지 않는 이메일입니다."));
        String token = UUID.randomUUID().toString();
        // 토큰을 DB나 Redis에 저장하거나, 이메일로 발송
        user.setResetToken(token); 
        userRepository.save(user);
        // 실제로는 이메일 발송 로직 필요하지만 생략
        return token;
    }

    // 비밀번호 재설정
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
            .orElseThrow(() -> new RuntimeException("유효하지 않은 토큰입니다."));
        user.setPassword(passwordEncoder.encode(newPassword)); // 반드시 암호화 필요!
        user.setResetToken(null); // 토큰 제거
        user.setPasswordChangedAt(LocalDateTime.now()); // 비밀번호 변경 시간 기록
        userRepository.save(user);
    }

    public void validatePasswordExpiry(User user) {
        LocalDateTime changedAt = user.getPasswordChangedAt();
        if (changedAt == null || changedAt.plusDays(PASSWORD_EXPIRE_DAYS).isBefore(LocalDateTime.now())) {
            throw new BusinessException("비밀번호가 만료되었습니다. 변경해주세요.");
    }
}
}
