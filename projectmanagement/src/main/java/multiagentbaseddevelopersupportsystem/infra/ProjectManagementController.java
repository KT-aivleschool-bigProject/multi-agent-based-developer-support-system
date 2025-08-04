package multiagentbaseddevelopersupportsystem.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//<<< Clean Arch / Inbound Adaptor

@RestController
// @RequestMapping(value="/projectManagements")
@Transactional
public class ProjectManagementController {

    @Autowired
    ProjectManagementRepository projectManagementRepository;

    @RequestMapping(
        value = "/projectManagements/createproject",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public ProjectManagement createProject(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody CreateProjectCommand createProjectCommand
    ) throws Exception {
        System.out.println(
            "##### /projectManagement/createProject  called #####"
        );
        ProjectManagement projectManagement = new ProjectManagement();
        // 값 복사
        projectManagement.setProjectName(createProjectCommand.getProjectName());
        projectManagement.setProjectDescription(createProjectCommand.getProjectDescription());
        projectManagement.setProjectStatus("INIT");
        // 필요시 추가 필드도 복사

        projectManagement.createProject(createProjectCommand);
        projectManagementRepository.save(projectManagement);
        return projectManagement;
    }

    @RequestMapping(
        value = "/projectManagements/addteammemberwithid",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public ProjectManagement addTeamMemberWithId(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody AddTeamMemberWithIdCommand addTeamMemberWithIdCommand
    ) throws Exception {
        System.out.println(
            "##### /projectManagement/addTeamMemberWithId  called #####"
        );
        ProjectManagement projectManagement = new ProjectManagement();
        projectManagement.addTeamMemberWithId(addTeamMemberWithIdCommand);
        projectManagementRepository.save(projectManagement);
        return projectManagement;
    }
}
//>>> Clean Arch / Inbound Adaptor
