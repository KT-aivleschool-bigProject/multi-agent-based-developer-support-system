package multiagentbaseddevelopersupportsystem.domain;

import java.util.Date;
import java.util.List;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import multiagentbaseddevelopersupportsystem.CommentApplication;

@Entity
@Table(name = "Comment_table")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long commentId;

    private String content;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    private Long postId;

    private Long userId;

    public static CommentRepository repository() {
        CommentRepository commentRepository = CommentApplication.applicationContext.getBean(
            CommentRepository.class
        );
        return commentRepository;
    }

    public void writeComment(WriteCommentCommand writeCommentCommand) {
        this.content = writeCommentCommand.getContent();
        this.postId = writeCommentCommand.getPostId();
        this.createdAt = new Date();
    }

    public void editComment(EditCommentCommand editCommentCommand) {
        this.content = editCommentCommand.getContent();
        this.updatedAt = new Date();
    }

    public void deleteComment() {
        // 삭제 로직은 repository에서 처리
    }

    public static void deleteCommentIncludedPost(PostDeleted postDeleted) {
        repository().findByPostId(postDeleted.getPostId()).forEach(comment -> {
            repository().delete(comment);
        });
    }
}

