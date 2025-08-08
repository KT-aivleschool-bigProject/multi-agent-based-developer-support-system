package multiagentbaseddevelopersupportsystem.domain;

import multiagentbaseddevelopersupportsystem.PostApplication;
import multiagentbaseddevelopersupportsystem.external.UserClient;

import javax.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.time.LocalDate;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collections;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="posts")
public class Post  {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long postId;    
    
    @Column(name="title", nullable=false, length = 200)
    private String title;    
    
    @Lob
    @Column(name="content", nullable=false)
    private String content;    
    
    @Column(name="view_count", nullable=false)
    private Integer viewCount;    

    @Column(name="created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;    

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name="updated_at")
    private Date updatedAt;    
    
    @Column(name="user_id", nullable=false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable=false)
    private PostStatus status;

    public static UserClient userClient() {
        UserClient userClient = PostApplication.applicationContext.getBean(
            UserClient.class
        );
        return userClient;
    }

    public PostResponseDto toDto() {
        UserDto user = userClient().getUserById(this.userId);
        return PostResponseDto.builder()
            .postId(this.postId)
            .title(this.title)
            .content(this.content)
            .viewCount(this.viewCount)
            .createdAt(this.createdAt)
            .updatedAt(this.updatedAt)
            .userName(user.getName())
            .build();
    }

}

