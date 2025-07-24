package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class TaskDetected extends AbstractEvent {

    private Long id;

    public TaskDetected() {
        super();
    }
}
//>>> DDD / Domain Event
