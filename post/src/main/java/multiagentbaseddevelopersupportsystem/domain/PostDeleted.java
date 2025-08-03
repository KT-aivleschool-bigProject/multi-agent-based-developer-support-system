package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

@Data
@ToString
public class PostDeleted extends AbstractEvent {

    private Long postId;

    public PostDeleted(Post aggregate) {
        super(aggregate);
    }

    public PostDeleted() {
        super();
    }
}
