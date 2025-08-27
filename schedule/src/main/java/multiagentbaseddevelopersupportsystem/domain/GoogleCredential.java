package multiagentbaseddevelopersupportsystem.domain;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.Instant;

@Entity
@Getter @Setter
@Table(name = "google_credentials", uniqueConstraints = @UniqueConstraint(columnNames = {"googleEmail"}))
public class GoogleCredential {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 연결된 구글 계정 이메일
    @Column(nullable = false)
    private String googleEmail;

    // 최신 액세스 토큰(옵션 보관)
    @Lob
    private String accessToken;

    // ★ 리프레시 토큰은 반드시 저장
    @Lob
    @Column(nullable = false)
    private String refreshToken;

    private Instant accessTokenExpiresAt;

    private Instant createdAt;
    private Instant updatedAt;
}
