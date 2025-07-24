package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class TaskCompleted extends AbstractEvent {

    private Long id;

    public TaskCompleted(TaskAssignment aggregate) {
        super(aggregate);
    }

    public TaskCompleted() {
        super();
    }
}
//>>> DDD / Domain Event
