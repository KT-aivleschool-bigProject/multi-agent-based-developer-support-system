package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class TaskCreated extends AbstractEvent {

    private Long id;

    public TaskCreated(TaskAssignment aggregate) {
        super(aggregate);
    }

    public TaskCreated() {
        super();
    }
}
//>>> DDD / Domain Event
