package multiagentbaseddevelopersupportsystem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.exception.BusinessException;
import multiagentbaseddevelopersupportsystem.security.TokenProvider;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    // 회원가입
    public void signup(SignupCommand command) {
        if (userRepository.existsByEmail(command.getEmail())) {
            throw new BusinessException("이미 사용 중인 이메일입니다.", "DUPLICATE_EMAIL");
        }
        User user = User.from(command, passwordEncoder);
        userRepository.save(user);
    }

    // 로그인
    public TokenDto login(LoginCommand command) {
        // 1. Login ID/PW 를 기반으로 AuthenticationToken 생성
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(command.getEmail(), command.getPassword());

        // 2. 실제로 검증 (사용자 비밀번호 체크) 이 이루어지는 부분
        //    authenticate 메서드가 실행이 될 때 CustomUserDetailsService 에서 만들었던 loadUserByUsername 메서드가 실행됨
        Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

        // 3. 인증 정보를 기반으로 JWT 토큰 생성
        TokenDto tokenDto = tokenProvider.generateTokenDto(authentication);

        // 4. RefreshToken 저장
        RefreshToken refreshToken = RefreshToken.builder()
                .key(authentication.getName())
                .value(tokenDto.getRefreshToken())
                .build();

        refreshTokenRepository.save(refreshToken);

        // 5. 토큰 발급
        return tokenDto;
    }

    // 토큰 재발급
    public TokenDto reissue(TokenRequestDto tokenRequestDto) {
        // 1. Refresh Token 검증
        if (!tokenProvider.validateToken(tokenRequestDto.getRefreshToken())) {
            throw new RuntimeException("Refresh Token 이 유효하지 않습니다.");
        }

        // 2. Access Token 에서 Member ID 가져오기
        Authentication authentication = tokenProvider.getAuthentication(tokenRequestDto.getAccessToken());

        // 3. 저장소에서 Member ID 를 기반으로 Refresh Token 값 가져옴
        RefreshToken refreshToken = refreshTokenRepository.findByKey(authentication.getName())
                .orElseThrow(() -> new RuntimeException("로그아웃 된 사용자입니다."));

        // 4. Refresh Token 일치하는지 검사
        if (!refreshToken.getValue().equals(tokenRequestDto.getRefreshToken())) {
            throw new RuntimeException("토큰의 유저 정보가 일치하지 않습니다.");
        }

        // 5. 새로운 토큰 생성
        TokenDto tokenDto = null;
        if (tokenProvider.refreshTokenPeriodCheck(refreshToken.getValue())) {
            // 5-1. Refresh Token의 유효기간이 3일 미만일 경우 전체(Access / Refresh) 재발급
            tokenDto = tokenProvider.generateTokenDto(authentication);

            // 6. Refresh Token 저장소 정보 업데이트
            RefreshToken newRefreshToken = refreshToken.updateValue(tokenDto.getRefreshToken());
            refreshTokenRepository.save(newRefreshToken);
        } else {
            // 5-2. Refresh Token의 유효기간이 3일 이상일 경우 Access Token만 재발급
            tokenDto = tokenProvider.createAccessToken(authentication);
        }

        // 토큰 발급
        return tokenDto;
    }

    // 로그아웃
    // public void logout(Long userId) {
    //     refreshTokenService.deleteAllByUserId(userId);
    // }
}