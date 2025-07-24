package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class DeadlineApproaching extends AbstractEvent {

    private Long id;

    public DeadlineApproaching(Notification aggregate) {
        super(aggregate);
    }

    public DeadlineApproaching() {
        super();
    }
}
//>>> DDD / Domain Event
