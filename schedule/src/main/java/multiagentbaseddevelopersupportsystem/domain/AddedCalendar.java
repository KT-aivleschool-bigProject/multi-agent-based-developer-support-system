package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class AddedCalendar extends AbstractEvent {

    private Long id;

    public AddedCalendar(Calendar aggregate) {
        super(aggregate);
    }

    public AddedCalendar() {
        super();
    }
}
//>>> DDD / Domain Event
