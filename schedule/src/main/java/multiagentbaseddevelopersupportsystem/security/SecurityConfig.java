package multiagentbaseddevelopersupportsystem.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * 게이트웨이가 인증을 담당하는 전제 하에 schedule의 보안 설정을 최소화.
 * - /schedule/google/** (OAuth 콜백/URL 발급 등) 허용
 * - /h2-console/**, /actuator/health 등 개발/헬스 엔드포인트 허용
 * - 그 외는 게이트웨이에서 차단/허용을 제어 (여기선 일단 허용해도 무방)
 * - csrf 비활성화, H2 콘솔 frame 허용
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()                     // API 서버: CSRF 미사용
            .headers().frameOptions().disable()   // H2 콘솔용
            .and()
            .authorizeRequests()
                .antMatchers(
                    "/schedule/google/auth/**",   // 인증 URL/콜백
                    "/schedule/google/status",    // 연동 상태 조회
                    "/schedule/google/calendars", // (게이트웨이 뒤면 열어놔도 OK)
                    "/schedule/google/events",    // (게이트웨이 뒤면 열어놔도 OK)
                    "/actuator/health",
                    "/h2-console/**",             // H2 콘솔 접근 허용
                    "/error"
                ).permitAll()
                // 게이트웨이에서 인증을 이미 끝낸다는 가정이면, 나머지도 열어도 됨
                // .anyRequest().permitAll()
                // 혹은, 내부 호출만 허용하고 싶다면 필요에 따라 제한
                .anyRequest().permitAll()
            .and()
            // 이 프로젝트에선 Spring Security의 OAuth2 Client/Login을 직접 쓰지 않음.
            // (우리가 수동으로 구글 OAuth URL 생성/토큰 교환)
            .oauth2Client().disable()
            .oauth2Login().disable();
    }
}