package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;

@Data
public class SavePostCommand {

    private String title;
    private String content;
}
