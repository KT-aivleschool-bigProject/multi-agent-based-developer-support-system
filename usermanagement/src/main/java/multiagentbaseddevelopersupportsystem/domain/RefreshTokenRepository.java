package multiagentbaseddevelopersupportsystem.domain;
import multiagentbaseddevelopersupportsystem.domain.RefreshToken;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    Optional<RefreshToken> findByKey(String key);

    List<RefreshToken> findAllByKeyIn(List<String> keys);

    void deleteByKey(String key);

    void deleteAllByKeyIn(List<String> keys);
}
