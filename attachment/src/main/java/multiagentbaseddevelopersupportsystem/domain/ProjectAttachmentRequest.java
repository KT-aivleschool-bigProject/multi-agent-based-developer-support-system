package multiagentbaseddevelopersupportsystem.domain;

import lombok.Data;

@Data
public class ProjectAttachmentRequest {
    private String projectId;
    private String fileId;
    private String sasUrl;
}
