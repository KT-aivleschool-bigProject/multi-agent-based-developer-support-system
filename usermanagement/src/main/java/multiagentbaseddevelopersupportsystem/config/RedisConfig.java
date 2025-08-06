package multiagentbaseddevelopersupportsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import lombok.extern.slf4j.Slf4j;

import java.time.Duration;

@Configuration
@Slf4j
@Profile("!test") // 테스트 프로필에서는 Redis 비활성화
@ConditionalOnProperty(name = "spring.data.redis.enabled", havingValue = "true", matchIfMissing = true)
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;
    
    @Value("${spring.data.redis.port}")
    private int redisPort;
    
    @Value("${spring.data.redis.password}")
    private String redisPassword;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        log.info("🔧 Redis 연결 설정 - Host: {}, Port: {}, Password: {}", 
                redisHost, redisPort, redisPassword.isEmpty() ? "없음" : "있음");
        
        // Redis Standalone 설정
        RedisStandaloneConfiguration configuration = new RedisStandaloneConfiguration();
        configuration.setHostName(redisHost);
        configuration.setPort(redisPort);
        
        // 비밀번호 설정 (있는 경우)
        if (!redisPassword.isEmpty()) {
            configuration.setPassword(redisPassword);
        }
        
        // 단순한 Lettuce 연결 (Pool 없이)
        LettuceConnectionFactory factory = new LettuceConnectionFactory(configuration);
        factory.setValidateConnection(true);
        
        return factory;
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        log.info("🔧 RedisTemplate 설정 중...");
        
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);

        // 단순한 Serializer 설정
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jackson2JsonRedisSerializer = 
            new GenericJackson2JsonRedisSerializer();

        // Key serialization
        template.setKeySerializer(stringRedisSerializer);
        template.setHashKeySerializer(stringRedisSerializer);
        
        // Value serialization
        template.setValueSerializer(jackson2JsonRedisSerializer);
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        
        template.afterPropertiesSet();

        log.info("✅ RedisTemplate 설정 완료");
        return template;
    }
}
