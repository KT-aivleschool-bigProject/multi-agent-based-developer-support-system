package multiagentbaseddevelopersupportsystem.domain;

import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

@Data
@ToString
public class Membersinvited extends AbstractEvent {

    private String eventType = "Membersinvited";
    private List<String> membersEmail;
    private Long projectId;
}
