package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

@Data
public class ProjectInvitationAccepted extends AbstractEvent {

    private String email;
    private String name;
    private String position;
}
