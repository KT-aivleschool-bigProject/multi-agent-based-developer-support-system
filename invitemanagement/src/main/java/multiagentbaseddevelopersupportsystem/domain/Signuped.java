package multiagentbaseddevelopersupportsystem.domain;

import java.util.*;
import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

@Data
@ToString
public class Signuped extends AbstractEvent {

    private String eventType = "Signuped";
    private Long userId;
    private String email;
}
