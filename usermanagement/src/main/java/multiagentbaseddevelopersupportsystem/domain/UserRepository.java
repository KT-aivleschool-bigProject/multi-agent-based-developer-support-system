package multiagentbaseddevelopersupportsystem.domain;

import java.util.Optional;
import multiagentbaseddevelopersupportsystem.domain.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
