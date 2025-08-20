package multiagentbaseddevelopersupportsystem.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SwaggerYamlPostRequest {
    private Long projectId;
    private Long fileId;
    private String oldYaml;
    private String newYaml;
}
