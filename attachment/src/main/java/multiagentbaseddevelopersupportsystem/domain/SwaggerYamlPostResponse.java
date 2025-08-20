package multiagentbaseddevelopersupportsystem.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SwaggerYamlPostResponse {
    private Long projectId;
    private Long fileId;
    private String finalYaml;
}
