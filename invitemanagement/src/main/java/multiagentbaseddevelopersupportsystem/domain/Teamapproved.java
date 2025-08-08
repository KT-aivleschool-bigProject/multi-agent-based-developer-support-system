package multiagentsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentsystem.domain.*;
import multiagentsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class Teamapproved extends AbstractEvent {
    
    private String eventType = "Teamapproved";
    private Long userId;
    private Long projectId;
    

    public Teamapproved(Invite aggregate) {
        super(aggregate);
    }

    public Teamapproved() {
        super();
    }
}
//>>> DDD / Domain Event
