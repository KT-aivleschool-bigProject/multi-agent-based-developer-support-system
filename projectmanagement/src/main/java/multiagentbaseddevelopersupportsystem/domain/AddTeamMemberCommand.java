package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;

@Data
public class AddTeamMemberCommand {

    private Long projectId;
    private Long memberId;
    private TeamRole role;
}
