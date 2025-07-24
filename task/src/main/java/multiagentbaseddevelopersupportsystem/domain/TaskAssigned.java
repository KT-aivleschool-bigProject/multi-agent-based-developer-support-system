package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class TaskAssigned extends AbstractEvent {

    private Long id;

    public TaskAssigned(TaskAssignment aggregate) {
        super(aggregate);
    }

    public TaskAssigned() {
        super();
    }
}
//>>> DDD / Domain Event
