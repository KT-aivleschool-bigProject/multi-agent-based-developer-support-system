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
@Table(name = "Attachment_table")
@Data
//<<< DDD / Aggregate Root
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long fileId;

    private Long postId;

    private String originalName;

    private String storedName;

    private String fileUrl;

    private String fileSize;

    private String fileType;

    private Date createdAt;

    public static AttachmentRepository repository() {
        AttachmentRepository attachmentRepository = BoardApplication.applicationContext.getBean(
            AttachmentRepository.class
        );
        return attachmentRepository;
    }

    //<<< Clean Arch / Port Method
    public static void deleteAttachmentIncludedPost(PostDeleted postDeleted) {
        //implement business logic here:

        /** Example 1:  new item 
        Attachment attachment = new Attachment();
        repository().save(attachment);

        */

        /** Example 2:  finding and process
        

        repository().findById(postDeleted.get???()).ifPresent(attachment->{
            
            attachment // do something
            repository().save(attachment);


         });
        */

    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
