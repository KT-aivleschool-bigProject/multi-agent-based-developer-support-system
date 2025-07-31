package multiagentbaseddevelopersupportsystem.domain;

import java.util.Date;
import javax.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import multiagentbaseddevelopersupportsystem.BoardApplication;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Attachment_table")
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long fileId;

    @Column(name="post_id", nullable=false)
    private Long postId;
    
    private String originalName;

    private String storedName;

    private String fileUrl;

    private Long fileSize;

    private String fileType;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    public static AttachmentRepository repository() {
        AttachmentRepository attachmentRepository = BoardApplication.applicationContext.getBean(
            AttachmentRepository.class
        );
        return attachmentRepository;
    }

    public static void deleteAttachmentIncludedPost(PostDeleted postDeleted) {
        repository().findByPostId(postDeleted.getPostId()).forEach(attachment -> {
            repository().delete(attachment);
        });
    }

}

