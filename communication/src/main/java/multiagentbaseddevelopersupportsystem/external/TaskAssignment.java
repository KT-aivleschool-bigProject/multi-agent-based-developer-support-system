package multiagentbaseddevelopersupportsystem.external;

import java.util.Date;
import lombok.Data;

@Data
public class TaskAssignment {

    private Long id;
    private String taskId;
    private String title;
    private String description;
    private String assignmentAgentId;
    private String status;
}
