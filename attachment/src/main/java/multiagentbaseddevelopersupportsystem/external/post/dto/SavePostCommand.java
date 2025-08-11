package multiagentbaseddevelopersupportsystem.external.post.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SavePostCommand {
    private String title;
    private String content;
}
