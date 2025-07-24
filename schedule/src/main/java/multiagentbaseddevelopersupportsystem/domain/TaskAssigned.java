package multiagentbaseddevelopersupportsystem.domain;

import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

@Data
@ToString
public class TaskAssigned extends AbstractEvent {

    private Long id;
}
