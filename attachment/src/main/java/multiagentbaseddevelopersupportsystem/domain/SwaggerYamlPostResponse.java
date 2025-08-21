package multiagentbaseddevelopersupportsystem.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwaggerYamlPostResponse {
    private String projectId;
    private String fileId;
    private String finalYaml;
    private String comment;
}
