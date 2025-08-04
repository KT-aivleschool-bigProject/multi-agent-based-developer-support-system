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

//<<< Clean Arch / Inbound Adaptor

@RestController
// @RequestMapping(value="/projectManagements")
@Transactional
public class ProjectManagementController {

    @Autowired
    ProjectManagementRepository projectManagementRepository;
    
    @Autowired
    AzureStorageService azureStorageService;

    @RequestMapping(
        value = "/projectManagements/createproject",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8",
        consumes = "multipart/form-data"
    )
    public ProjectManagement createProject(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestParam("projectName") String projectName,
        @RequestParam("projectDescription") String projectDescription,
        @RequestParam(value = "files", required = false) List<MultipartFile> files,
        @RequestParam(value = "projectStatus", required = false) String projectStatus
    ) throws Exception {
        System.out.println(
            "##### /projectManagement/createProject  called #####"
        );
        
        CreateProjectCommand createProjectCommand = new CreateProjectCommand();
        createProjectCommand.setProjectName(projectName);
        createProjectCommand.setProjectDescription(projectDescription);
        createProjectCommand.setProjectStatus(ProjectStatus.INIT);
        createProjectCommand.setFiles(files);
        
        // 파일 업로드 처리
        if (files != null && !files.isEmpty()) {
            try {
                List<String> uploadedUrls = azureStorageService.uploadFiles(files);
                createProjectCommand.setAttachments(uploadedUrls);
            } catch (IOException e) {
                throw new RuntimeException("파일 업로드 중 오류가 발생했습니다: " + e.getMessage(), e);
            }
        }
        
        ProjectManagement projectManagement = new ProjectManagement();
        
        projectManagement.createProject(createProjectCommand);
        projectManagementRepository.save(projectManagement);
        return projectManagement;
    }
    
    /**
     * 다중 파일 업로드 전용 엔드포인트
     */
    @RequestMapping(
        value = "/projectManagements/upload-files",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public List<String> uploadMultipleFiles(
        @RequestParam("files") List<MultipartFile> files
    ) throws Exception {
        System.out.println("##### /projectManagement/uploadMultipleFiles called #####");
        
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }
        
        try {
            return azureStorageService.uploadFiles(files);
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 단일 파일 업로드 엔드포인트
     */
    @RequestMapping(
        value = "/projectManagements/upload-file",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public String uploadSingleFile(
        @RequestParam("file") MultipartFile file
    ) throws Exception {
        System.out.println("##### /projectManagement/uploadSingleFile called #####");
        
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }
        
        try {
            System.out.println("Calling azureStorageService.uploadFile...");
            String result = azureStorageService.uploadFile(file);
            System.out.println("Upload successful: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("Upload failed with exception: " + e.getClass().getName());
            System.err.println("Exception message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * Azure Storage 연결 테스트 엔드포인트
     */
    @RequestMapping(
        value = "/projectManagements/test-azure-connection",
        method = RequestMethod.GET,
        produces = "application/json;charset=UTF-8"
    )
    public String testAzureConnection() {
        System.out.println("##### /projectManagement/testAzureConnection called #####");
        
        try {
            // Azure Storage 서비스 초기화 테스트
            azureStorageService.initializeClient();
            return "Azure Storage 연결 성공";
        } catch (Exception e) {
            return "Azure Storage 연결 실패: " + e.getMessage();
        }
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
