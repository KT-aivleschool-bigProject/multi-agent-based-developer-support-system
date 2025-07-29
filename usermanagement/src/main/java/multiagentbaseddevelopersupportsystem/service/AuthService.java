package multiagentbaseddevelopersupportsystem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.exception.BusinessException;
import multiagentbaseddevelopersupportsystem.security.TokenProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    public void signup(SignupCommand command) {
        if (userRepository.existsByEmail(command.getEmail())) {
            throw new BusinessException("이미 사용 중인 이메일입니다.", "DUPLICATE_EMAIL");
        }
        User user = User.toEntity(command, passwordEncoder);
        userRepository.save(user);
        log.info("회원가입 성공: {}", command.getEmail());
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
}
