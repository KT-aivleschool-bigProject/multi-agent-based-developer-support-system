package multiagentbaseddevelopersupportsystem.domain;

import java.util.Date;
import javax.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
@Table(name = "swagger_yaml_posts")
public class SwaggerYamlPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long syId;

    @Lob
    @Column(name = "yaml_content", nullable = false)
    private String yamlContent;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", updatable = false)
    private Date createdAt;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    private Date updatedAt;
}
