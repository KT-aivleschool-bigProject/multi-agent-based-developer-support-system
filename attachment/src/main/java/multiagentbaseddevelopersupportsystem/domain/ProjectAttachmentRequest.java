package multiagentbaseddevelopersupportsystem.domain;

import lombok.Data;

@Data
public class ProjectAttachmentRequest {
    private Long fileId;
    private String sasUrl;
}
