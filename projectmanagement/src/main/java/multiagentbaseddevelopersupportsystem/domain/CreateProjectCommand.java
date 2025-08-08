package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CreateProjectCommand {

    private String projectName;
    private String projectDescription;
    private List<String> attachments; // 파일 URL 목록
    private List<MultipartFile> files; // 실제 파일 데이터
    private ProjectStatus projectStatus;
    private List<String> inviteEmails; // 추가 : 초대할 사용자의 메일
}
