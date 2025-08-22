package multiagentbaseddevelopersupportsystem.service;

import java.util.UUID;

import javax.transaction.Transactional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.User;
import multiagentbaseddevelopersupportsystem.domain.UserDto;
import multiagentbaseddevelopersupportsystem.domain.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;

    public UserDto getUserById(Long userId) {
       User user = userRepository.findById(userId)
               .orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.builder()
                .name(user.getName())
                .email(user.getEmail())
                .position(user.getPosition())
                .build();
    }
}
