package multiagentbaseddevelopersupportsystem;

import multiagentbaseddevelopersupportsystem.config.kafka.KafkaProcessor;
import multiagentbaseddevelopersupportsystem.domain.Role;
import multiagentbaseddevelopersupportsystem.domain.User;
import multiagentbaseddevelopersupportsystem.domain.UserRepository;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableBinding(KafkaProcessor.class)
@EnableFeignClients
public class UsermanagementApplication {

    public static ApplicationContext applicationContext;

    public static void main(String[] args) {
        applicationContext =
            SpringApplication.run(UsermanagementApplication.class, args);
    }

    @Bean
    CommandLineRunner init(UserRepository userRepository, PasswordEncoder encoder) {
        return args -> {
            if (!userRepository.existsByEmail("guest@system.com")) {
                userRepository.save(User.builder()
                    .email("guest@system.com")
                    .password(encoder.encode("guest1234!"))
                    .name("Guest User")
                    .position("Guest Position")
                    .role(Role.USER)
                    .passwordChangedAt(LocalDateTime.now())
                    .build());
            }
        };
    }
}
