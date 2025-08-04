package multiagentbaseddevelopersupportsystem.domain;

import java.util.Date;
import java.util.List;
import javax.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import multiagentbaseddevelopersupportsystem.CommentApplication;

@Entity
@Table(name = "Comment_table")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long commentId;

    @Column(name="content", nullable=false, length=500)
    private String content;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="created_at", nullable=false)
    private Date createdAt;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="updated_at", nullable=false)
    private Date updatedAt;

    @Column(name="post_id", nullable=false)
    private Long postId;

    @Column(name="user_id", nullable=false)
    private Long userId;

    public static CommentRepository repository() {
        CommentRepository commentRepository = CommentApplication.applicationContext.getBean(
            CommentRepository.class
        );
        return commentRepository;
    }

    public static void deleteCommentIncludedPost(PostDeleted postDeleted) {
        repository().findByPostId(postDeleted.getPostId()).forEach(comment -> {
            repository().delete(comment);
        });
    }
}

