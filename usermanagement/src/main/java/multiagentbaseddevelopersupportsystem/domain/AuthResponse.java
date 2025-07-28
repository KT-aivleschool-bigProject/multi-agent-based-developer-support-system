package multiagentbaseddevelopersupportsystem.domain;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long userId;
    private String email;
    private String name;
    private Role role;
    private Long accessTokenExpiresIn;
    private Long refreshTokenExpiresIn;
    private String message;
}