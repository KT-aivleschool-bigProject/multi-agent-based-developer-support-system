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
        
    private String title;    
        
    private String content;    
        
    private Integer viewCount;    

    @CreationTimestamp
    private Date createdAt;    

    @UpdateTimestamp
    private Date updatedAt;    
        
    private Long userId;

    public static PostRepository repository(){
        PostRepository postRepository = BoardApplication.applicationContext.getBean(PostRepository.class);
        return postRepository;
    }

    public void savePost(SavePostCommand savePostCommand){
        
        //implement business logic here:
        

        multiagentbaseddevelopersupportsystem.external.PostQuery postQuery = new multiagentbaseddevelopersupportsystem.external.PostQuery();
        // postQuery.set??()        
          = PostApplication.applicationContext
            .getBean(multiagentbaseddevelopersupportsystem.external.Service.class)
            .post(postQuery);

    }

    public void deletePost(){
        
        //implement business logic here:
        


        PostDeleted postDeleted = new PostDeleted(this);
        postDeleted.publishAfterCommit();
    }

    public void increaseViewCount(){
        
        //implement business logic here:
        


    }

    public void editPost(EditPostCommand editPostCommand){
        
        //implement business logic here:
        


    }




}

