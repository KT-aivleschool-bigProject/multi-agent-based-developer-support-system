package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class ScheduleSuggested extends AbstractEvent {

    private Long id;

    public ScheduleSuggested(Calendar aggregate) {
        super(aggregate);
    }

    public ScheduleSuggested() {
        super();
    }
}
//>>> DDD / Domain Event
