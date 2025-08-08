package multiagentbaseddevelopersupportsystem.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component  
@RequiredArgsConstructor
@Slf4j    
public class JwtTokenFilter extends OncePerRequestFilter {

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";

    private final TokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        log.debug("🔍 JWT 필터 실행 - URI: {}", requestURI);
        
        // 1. Request Header 에서 토큰을 꺼냄
        String jwt = resolveToken(request);
        
        if (StringUtils.hasText(jwt)) {
            log.debug("🔑 토큰 발견: {}...", jwt.substring(0, Math.min(jwt.length(), 20)));
            
            // 2. validateToken 으로 토큰 유효성 검사
            if (tokenProvider.validateToken(jwt)) {
                // 정상 토큰이면 해당 토큰으로 Authentication 을 가져와서 SecurityContext 에 저장
                Authentication authentication = tokenProvider.getAuthentication(jwt);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("✅ 인증 성공 - 사용자: {}", authentication.getName());
            } else {
                log.warn("❌ 유효하지 않은 토큰 - URI: {}", requestURI);
            }
        } else {
            log.debug("🔍 토큰 없음 - URI: {}", requestURI);
        }
        
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length()).trim(); 
        }
        return null;
    }
}
