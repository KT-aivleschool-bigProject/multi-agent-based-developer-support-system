package multiagentbaseddevelopersupportsystem.domain;

import lombok.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

@Data
@ToString
public class PostCreatedByAttachmentAgent extends AbstractEvent{
    
    private Long postId;
    private Long fileId;
}