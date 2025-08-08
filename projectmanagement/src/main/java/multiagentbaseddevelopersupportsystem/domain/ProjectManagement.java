package multiagentbaseddevelopersupportsystem.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
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

    @ElementCollection
    @CollectionTable(name = "project_attachments", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "attachment_url")
    private List<String> attachments;

    public static ProjectManagementRepository repository() {
        ProjectManagementRepository projectManagementRepository = ProjectmanagementApplication.applicationContext.getBean(
            ProjectManagementRepository.class
        );
        return projectManagementRepository;
    }

    //<<< Clean Arch / Port Method
    //프로젝트 생성 및 초대 처리
    public void createProject(CreateProjectCommand createProjectCommand) {
        // 프로젝트 정보 설정
        this.projectName = createProjectCommand.getProjectName();
        this.projectDescription = createProjectCommand.getProjectDescription();
        this.projectStatus = createProjectCommand.getProjectStatus();

        // 첨부파일 URL 설정
        if (createProjectCommand.getAttachments() != null) {
            this.attachments = createProjectCommand.getAttachments();
        }

        // 프로젝트 생성 이벤트 발행
        ProjectCreated projectCreated = new ProjectCreated(this);
        projectCreated.publishAfterCommit();

        // 초대 이메일이 있다면 초대 이벤트 발행
        if (createProjectCommand.getInviteEmails() != null && !createProjectCommand.getInviteEmails().isEmpty()) {
            inviteMembers(createProjectCommand.getInviteEmails());
        }
    }

    //>>> Clean Arch / Port Method
    //이메일 기반 팀원 초대 이벤트 발행
    public void inviteMembers(List<String> emails) {
        Membersinvited event = new Membersinvited(this, emails);
        event.publishAfterCommit();
    }
}
