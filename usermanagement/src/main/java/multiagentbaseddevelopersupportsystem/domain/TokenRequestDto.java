package multiagentbaseddevelopersupportsystem.domain;

import lombok.Data;

@Data
public class TokenRequestDto {
    private String accessToken;
    private String refreshToken;
}