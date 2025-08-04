package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class MemberIdInvited extends AbstractEvent {

    private Long projectId;
    private Long memberId;

    public MemberIdInvited(ProjectManagement aggregate) {
        super(aggregate);
    }

    public MemberIdInvited() {
        super();
    }
}
//>>> DDD / Domain Event
