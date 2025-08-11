package multiagentbaseddevelopersupportsystem.external.ai.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AiGenerateRequest {
    private long postId;       // 로깅용, 없으면 0
    private List<String> files; // FastAPI가 직접 GET 가능한 절대 URL
    private String hint;       // 선택
}
