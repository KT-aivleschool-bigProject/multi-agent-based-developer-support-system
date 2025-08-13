package multiagentbaseddevelopersupportsystem.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByProjectId(Long projectId, Pageable pageable);
    Page<Post> findByProjectIdAndTitleContaining(Long projectId, String searchKeyword, Pageable pageable);
}
