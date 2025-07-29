package multiagentbaseddevelopersupportsystem.domain;

import org.springframework.data.annotation.Id;
import lombok.*;
import org.springframework.data.redis.core.RedisHash;

@RedisHash(value = "refreshToken", timeToLive = 604800) // TTL: 7일
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    private String key;
    private String value;

    public RefreshToken updateValue(String newToken) {
        this.value = newToken;
        return this;
    }
}