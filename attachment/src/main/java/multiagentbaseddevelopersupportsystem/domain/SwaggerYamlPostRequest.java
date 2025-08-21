package multiagentbaseddevelopersupportsystem.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SwaggerYamlPostRequest {
    private String projectId;
    private String fileId;
    private String oldYaml;
    private String newYaml;
}
