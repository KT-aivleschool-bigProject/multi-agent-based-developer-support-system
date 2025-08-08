package multiagentbaseddevelopersupportsystem.external.attachment;

import lombok.Data;

@Data
public class AttachmentDto {
    private Long fileId;
    private Long postId;
    private String originalName;
    private String storedName;
    private String fileUrl;
    private Long fileSize;
    private String fileType;
}
