package multiagentbaseddevelopersupportsystem.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import multiagentbaseddevelopersupportsystem.ProjectmanagementApplication;

@Entity
@Table(name = "ProjectManagement_table")
@Data
//<<< DDD / Aggregate Root
public class ProjectManagement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long projectId;

    private String projectName;

    private String projectDescription;

    private ProjectStatus projectStatus;

    public static ProjectManagementRepository repository() {
        ProjectManagementRepository projectManagementRepository = ProjectmanagementApplication.applicationContext.getBean(
            ProjectManagementRepository.class
        );
        return projectManagementRepository;
    }

    //<<< Clean Arch / Port Method
    public void createProject(CreateProjectCommand createProjectCommand) {
        //implement business logic here:

        ProjectCreated projectCreated = new ProjectCreated(this);
        projectCreated.publishAfterCommit();
    }

    //>>> Clean Arch / Port Method
    //<<< Clean Arch / Port Method
    public void addTeamMemberWithId(
        AddTeamMemberWithIdCommand addTeamMemberWithIdCommand
    ) {
        //implement business logic here:

        MemberIdInvited memberIdInvited = new MemberIdInvited(this);
        memberIdInvited.publishAfterCommit();
    }
    //>>> Clean Arch / Port Method

}
//>>> DDD / Aggregate Root
