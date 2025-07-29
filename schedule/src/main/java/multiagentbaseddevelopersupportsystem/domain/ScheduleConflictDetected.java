package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class ScheduleConflictDetected extends AbstractEvent {

    private Long id;

    public ScheduleConflictDetected(Calendar aggregate) {
        super(aggregate);
    }

    public ScheduleConflictDetected() {
        super();
    }
}
//>>> DDD / Domain Event
