package multiagentbaseddevelopersupportsystem.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AttachmentUrlBuilder {

    @Value("${attachment.public-base-url}")
    private String baseUrl; // 예: http://attachment:8088

    /** FastAPI가 GET 가능한 절대 URL로 변환 */
    public String downloadUrl(String storedFilename) {
        // AttachmentController: GET /attachments/download/{filename}
        return String.format("%s/attachments/download/%s", baseUrl, storedFilename);
    }
}
