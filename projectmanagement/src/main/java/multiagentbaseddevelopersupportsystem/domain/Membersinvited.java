package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class Membersinvited extends AbstractEvent {

    private String eventType = "Membersinvited"; // 소문자로 Kafka 수신 쪽 일치
    private Long projectId;
    private List<String> membersEmail;

    public Membersinvited(ProjectManagement aggregate, List<String> emails) {
        super(aggregate);
        this.projectId = aggregate.getProjectId();
        this.membersEmail  = emails;
    }

    public Membersinvited() {
        super();
    }
}

//>>> DDD / Domain Event
