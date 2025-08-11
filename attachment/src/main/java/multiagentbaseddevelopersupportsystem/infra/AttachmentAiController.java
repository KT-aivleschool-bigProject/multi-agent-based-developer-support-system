package multiagentbaseddevelopersupportsystem.infra;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

import multiagentbaseddevelopersupportsystem.external.ai.dto.AiGenerateResponse;
import multiagentbaseddevelopersupportsystem.service.AttachmentAiOrchestrator;

@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
public class AttachmentAiController {

    private final AttachmentAiOrchestrator orchestrator;

    @PostMapping("/{bundleId}/ai/run")
    public Map<String,Object> run(
            @PathVariable String bundleId,
            @RequestBody AiRunRequest req,
            @RequestHeader(value="X-User-Id", required=false) Long userIdHeader
    ) {
        req.validate();

        if ("AUTO_POST".equals(req.getMode())) {
            Long userId = (req.getUserId() != null) ? req.getUserId() : userIdHeader;
            if (userId == null || req.getProjectId() == null) {
                throw new IllegalArgumentException("AUTO_POST는 userId, projectId가 필요합니다.");
            }
            Long postId = orchestrator.autoPost(
                    userId,
                    req.getProjectId(),
                    req.getStoredFilenames(),
                    req.getFileUrls(),
                    req.getHint()
            );
            return Map.of("postId", postId);
        } else {
            AiGenerateResponse res = orchestrator.suggest(
                    req.getStoredFilenames(),
                    req.getFileUrls(),
                    req.getHint()
            );
            return Map.of(
                    "title", res.getTitle(),
                    "content", res.getContent(),
                    "confidence", res.getConfidence(),
                    "filesProcessed", res.getFilesProcessed()
            );
        }
    }

    @Data
    public static class AiRunRequest {
        private String mode; // AUTO_POST | SUGGEST
        private Long projectId;      // AUTO_POST 때 필수
        private Long userId;         // AUTO_POST 때 필수(혹은 헤더 X-User-Id)
        private List<String> storedFilenames; // Attachment 등록된 파일명
        private List<String> fileUrls;        // 등록 전 Azure URL도 허용
        private String hint;

        public void validate() {
            if (!"AUTO_POST".equals(mode) && !"SUGGEST".equals(mode)) {
                throw new IllegalArgumentException("mode는 AUTO_POST 또는 SUGGEST 여야 합니다.");
            }
            boolean hasStored = storedFilenames != null && !storedFilenames.isEmpty();
            boolean hasUrls   = fileUrls != null && !fileUrls.isEmpty();
            if (!hasStored && !hasUrls) {
                throw new IllegalArgumentException("storedFilenames 또는 fileUrls 중 하나는 필수입니다.");
            }
        }
    }
}
