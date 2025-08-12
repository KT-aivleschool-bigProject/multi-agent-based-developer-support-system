package multiagentbaseddevelopersupportsystem.infra;

import java.util.Optional;
import java.util.List;
import java.io.IOException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value="/projectManagements")
@Transactional
public class ProjectManagementController {

    @Autowired
    ProjectManagementRepository projectManagementRepository;

    @PostMapping("/init")
    public ResponseEntity<Long> initProject(@RequestHeader("X-User-Id") Long userId) {
        // 빈 프로젝트 생성
        ProjectManagement project = new ProjectManagement();
        project.setProjectName(""); // 빈 값 또는 기본값
        project.setProjectDescription("");
        project.setProjectStatus(ProjectStatus.INIT);

        projectManagementRepository.save(project);

        return ResponseEntity.status(201).body(project.getProjectId());
    }

    @RequestMapping(
        value = "/createproject",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8",
        consumes = "multipart/form-data"
    )
    public ProjectManagement createProject(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestParam("projectId") Long projectId, // projectId 추가
        @RequestParam("projectName") String projectName,
        @RequestParam("projectDescription") String projectDescription,
        @RequestParam(value = "files", required = false) List<MultipartFile> files,
        @RequestParam(value = "projectStatus", required = false) String projectStatus,
        @RequestParam(value = "inviteEmails", required = false) List<String> inviteEmails
    ) throws Exception {
        System.out.println("##### /projectManagement/createProject  called #####");

        Optional<ProjectManagement> optionalProject = projectManagementRepository.findById(projectId);
        if (!optionalProject.isPresent()) {
            throw new RuntimeException("Project not found with ID: " + projectId);
        }

        ProjectManagement projectManagement = optionalProject.get();

        // 프로젝트 정보 업데이트
        projectManagement.setProjectName(projectName);
        projectManagement.setProjectDescription(projectDescription);
        if (projectStatus != null) {
            projectManagement.setProjectStatus(ProjectStatus.valueOf(projectStatus));
        }

        projectManagementRepository.save(projectManagement);

        return projectManagement;
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
