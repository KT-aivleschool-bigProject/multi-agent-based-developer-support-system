package multiagentbaseddevelopersupportsystem.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class DocAgentResponse {
    private String title;
    private String content;
}
