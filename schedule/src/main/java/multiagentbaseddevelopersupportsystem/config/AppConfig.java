// schedule/src/main/java/multiagentbaseddevelopersupportsystem/config/AppConfig.java
package multiagentbaseddevelopersupportsystem.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * UserClient 등에서 사용할 RestTemplate 빈 정의
 */
@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // 연결/응답 타임아웃은 필요시 조정
        return builder
                .setConnectTimeout(Duration.ofSeconds(3))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
    }
}