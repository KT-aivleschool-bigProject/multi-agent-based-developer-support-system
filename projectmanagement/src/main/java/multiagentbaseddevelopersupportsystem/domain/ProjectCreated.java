package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class ProjectCreated extends AbstractEvent {

    private Long projectId;
    private String projectName;
    private String projectDescription;
    private ProjectStatus projectStatus;
    private List<String> inviteEmails;
    
    public ProjectCreated(ProjectManagement aggregate) {
        super(aggregate);
        // 프로젝트 ID를 명시적으로 설정
        this.projectId = aggregate.getProjectId();
    }

    public ProjectCreated() {
        super();
    }
}
//>>> DDD / Domain Event
