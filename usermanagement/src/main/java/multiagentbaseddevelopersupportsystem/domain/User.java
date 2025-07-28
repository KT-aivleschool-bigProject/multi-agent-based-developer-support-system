package multiagentbaseddevelopersupportsystem.domain;

import javax.persistence.*;

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
@Table(name = "User_table")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    public static User from(SignupCommand cmd, PasswordEncoder encoder) {
        return User.builder()
                .email(cmd.getEmail())
                .password(encoder.encode(cmd.getPassword()))
                .name(cmd.getName())
                .position(cmd.getPosition())
                .role(Role.USER)
                .build();
    }
}

