package multiagentbaseddevelopersupportsystem.infra;

import java.util.Optional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/projectManagements")
@Transactional
public class ProjectManagementController {

    @Autowired
    ProjectManagementRepository projectManagementRepository;

    @PostMapping("/init")
    public ResponseEntity<Map<String, Long>> initProject(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        // 빈 프로젝트 생성
        ProjectManagement project = new ProjectManagement();
        project.setProjectName(""); // 빈 값 또는 기본값
        project.setProjectDescription("");
        project.setProjectStatus(ProjectStatus.INIT);

        projectManagementRepository.save(project);

        Map<String, Long> result = new HashMap<>();
        result.put("projectId", project.getProjectId());
        return ResponseEntity.status(201).body(result);
    }

    @PutMapping("/{projectId}/saveproject")
    public ProjectManagement updateProject(
        @PathVariable("projectId") Long projectId,
        @RequestParam("projectName") String projectName,
        @RequestParam("projectDescription") String projectDescription,
        @RequestParam(value = "githubUrl", required = false) String githubUrl,
        @RequestParam(value = "inviteEmails", required = false) List<String> inviteEmails
    ) throws Exception {
        System.out.println("##### /projectManagements/" + projectId + "/saveproject called #####");

        Optional<ProjectManagement> optionalProject = projectManagementRepository.findById(projectId);
        if (!optionalProject.isPresent()) {
            throw new RuntimeException("Project not found with ID: " + projectId);
        }

        ProjectManagement projectManagement = optionalProject.get();

        // CreateProjectCommand 생성
        CreateProjectCommand createProjectCommand = new CreateProjectCommand();
        createProjectCommand.setProjectName(projectName);
        createProjectCommand.setProjectDescription(projectDescription);
        createProjectCommand.setGithubUrl(githubUrl);
        createProjectCommand.setProjectStatus(ProjectStatus.valueOf("TEAM_BUILDING"));
        createProjectCommand.setInviteEmails(inviteEmails);

        // 도메인 로직 호출 (ProjectCreated 이벤트 발행)
        projectManagement.createProject(createProjectCommand);
        
        // 영속화
        projectManagementRepository.save(projectManagement);

        return projectManagement;
    }

    // 프로젝트 조회 API
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectManagement> getProject(@PathVariable("projectId") Long projectId) {
        System.out.println("##### /projectManagements/" + projectId + " getProject called #####");

        Optional<ProjectManagement> optionalProject = projectManagementRepository.findById(projectId);
        if (!optionalProject.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        ProjectManagement project = optionalProject.get();
        return ResponseEntity.ok(project);
    }

    // 모든 프로젝트 목록 조회 API
    @GetMapping
    public ResponseEntity<List<ProjectManagement>> getAllProjects() {
        System.out.println("##### /projectManagements getAllProjects called #####");

        Iterable<ProjectManagement> projectsIterable = projectManagementRepository.findAll();
        List<ProjectManagement> projects = new ArrayList<>();
        projectsIterable.forEach(projects::add);
        return ResponseEntity.ok(projects);
    }


    @RequestMapping(
        value = "/{projectId}/invite",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public String inviteTeamMembers(
        @PathVariable("projectId") Long projectId,
        @RequestBody List<String> emails
    ) {
        System.out.println("##### /projectManagements/" + projectId + "/invite called #####");

        Optional<ProjectManagement> optionalProject = projectManagementRepository.findById(projectId);

        if (!optionalProject.isPresent()) {
            throw new RuntimeException("Project not found with ID: " + projectId);
        }

        ProjectManagement project = optionalProject.get();

        if (emails == null || emails.isEmpty()) {
            throw new IllegalArgumentException("초대할 이메일 목록이 비어 있습니다.");
        }

        project.inviteMembers(emails);  // 이벤트 발행
        projectManagementRepository.save(project);  // 영속화

        return "팀원 초대 이벤트가 성공적으로 발행되었습니다.";
    }

}
