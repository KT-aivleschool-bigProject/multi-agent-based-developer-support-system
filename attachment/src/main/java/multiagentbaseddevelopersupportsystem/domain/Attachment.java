package multiagentbaseddevelopersupportsystem.domain;

import java.util.Date;
import javax.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import multiagentbaseddevelopersupportsystem.AttachmentApplication;

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
    
    @Column(name="original_name", nullable=false)
    private String originalName;

    @Column(name="stored_name", nullable=false)
    private String storedName;

    @Column(name="file_url", nullable=false)
    private String fileUrl;

    @Column(name="file_size", nullable=false)
    private Long fileSize;

    @Column(name="file_type", nullable=false)
    private String fileType;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    public static AttachmentRepository repository() {
        AttachmentRepository attachmentRepository = AttachmentApplication.applicationContext.getBean(
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

