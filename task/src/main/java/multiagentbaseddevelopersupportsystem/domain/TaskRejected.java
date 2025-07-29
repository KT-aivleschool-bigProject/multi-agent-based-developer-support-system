package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class TaskRejected extends AbstractEvent {

    private Long id;

    public TaskRejected(TaskAssignment aggregate) {
        super(aggregate);
    }

    public TaskRejected() {
        super();
    }
}
//>>> DDD / Domain Event
