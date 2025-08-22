package multiagentbaseddevelopersupportsystem.service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import multiagentbaseddevelopersupportsystem.domain.User;
import multiagentbaseddevelopersupportsystem.domain.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService2 {
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void increaseLoginFailCount(User user) {
        int failCount = user.getLoginFailCount() + 1;
        user.setLoginFailCount(failCount);
        if (failCount >= 5) {
            user.setLocked(true);
        }
        userRepository.save(user);
    }
}
