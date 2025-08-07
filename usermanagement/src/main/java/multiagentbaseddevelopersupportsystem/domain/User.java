package multiagentbaseddevelopersupportsystem.domain;

import javax.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Role;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // MySQL AUTO_INCREMENT
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "profile_image", length = 2083)
    private String profileImage;

    @Column(name = "position", nullable = false, length = 50)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @Column(name = "project_id")
    private Long projectId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static User toEntity(SignupCommand cmd, PasswordEncoder encoder) {
        return User.builder()
                .email(cmd.getEmail())
                .password(encoder.encode(cmd.getPassword()))
                .name(cmd.getName())
                .position(cmd.getPosition())
                .role(Role.USER)
                .build();
    }
}

