package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;

@Data
public class CreateProjectCommand {

    private String projectName;
    private String projectDescription;
    private List<String> attachments;
    private ProjectStatus projectStatus;
}
