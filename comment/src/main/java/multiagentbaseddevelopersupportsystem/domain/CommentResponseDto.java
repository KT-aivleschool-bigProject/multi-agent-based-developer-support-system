package multiagentbaseddevelopersupportsystem.domain;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CommentResponseDto {
    private Long commentId;
    private String content;
    private Date createdAt;
    private Date updatedAt;
    private Long postId;
    private String userName;
}
