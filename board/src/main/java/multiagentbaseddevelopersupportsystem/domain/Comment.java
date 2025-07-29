package multiagentbaseddevelopersupportsystem.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import multiagentbaseddevelopersupportsystem.BoardApplication;

@Entity
@Table(name = "Comment_table")
@Data
//<<< DDD / Aggregate Root
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long commentId;

    private String content;

    private Date createdAt;

    private Date updatedAt;

    private Long postId;

    private Long userId;

    public static CommentRepository repository() {
        CommentRepository commentRepository = BoardApplication.applicationContext.getBean(
            CommentRepository.class
        );
        return commentRepository;
    }

    //<<< Clean Arch / Port Method
    public void writeComment(WriteCommentCommand writeCommentCommand) {
        //implement business logic here:

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public void editComment(EditCommentCommand editCommentCommand) {
        //implement business logic here:

    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public void deleteComment() {
        //implement business logic here:

    }

    //>>> Clean Arch / Port Method

    //<<< Clean Arch / Port Method
    public static void deleteCommentIncludedPost(PostDeleted postDeleted) {
        //implement business logic here:

        /** Example 1:  new item 
        Comment comment = new Comment();
        repository().save(comment);

        */

        /** Example 2:  finding and process
        

        repository().findById(postDeleted.get???()).ifPresent(comment->{
            
            comment // do something
            repository().save(comment);


         });
        */

    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
