package multiagentbaseddevelopersupportsystem.domain;

import multiagentbaseddevelopersupportsystem.BoardApplication;
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
@Table(name="Post_table")
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

    // public static PostRepository repository(){
    //     PostRepository postRepository = BoardApplication.applicationContext.getBean(PostRepository.class);
    //     return postRepository;
    // }

    // public static Post startPostWriting(Long userId) {
    //     Post post = Post.builder()
    //         .userId(userId)
    //         .build();

    //     return repository().save(post);  // save() 후 postId가 자동 생성됨
    // }

    // public void savePost(SavePostCommand savePostCommand){
        
    //     //implement business logic here:
        

    //     multiagentbaseddevelopersupportsystem.external.PostQuery postQuery = new multiagentbaseddevelopersupportsystem.external.PostQuery();
    //     // postQuery.set??()        
    //       = PostApplication.applicationContext
    //         .getBean(multiagentbaseddevelopersupportsystem.external.Service.class)
    //         .post(postQuery);

    // }

    // public void deletePost(){
        
    //     //implement business logic here:
        


    //     PostDeleted postDeleted = new PostDeleted(this);
    //     postDeleted.publishAfterCommit();
    // }

    // public void increaseViewCount(){
        
    //     //implement business logic here:
        


    // }

    // public void editPost(EditPostCommand editPostCommand){
        
    //     //implement business logic here:
        


    // }




}

