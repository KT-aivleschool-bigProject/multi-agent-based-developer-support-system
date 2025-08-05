package multiagentbaseddevelopersupportsystem.domain;

import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PostResponseDto {
    private Long postId;    
    private String title;    
    private String content;    
    private Integer viewCount;    
    private Date createdAt;    
    private Date updatedAt;    
    private String userName;
}
