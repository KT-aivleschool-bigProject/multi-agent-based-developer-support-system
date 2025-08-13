package multiagentbaseddevelopersupportsystem.domain;

import lombok.Data;
import lombok.ToString;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

@Data
@ToString
public class ProjectAttachmentAutoCreated extends AbstractEvent{
    private Long fileId;
    private String title;
    private String content;
}
