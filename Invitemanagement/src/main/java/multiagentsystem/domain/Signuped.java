package multiagentsystem.domain;

import java.util.*;
import lombok.*;
import multiagentsystem.domain.*;
import multiagentsystem.infra.AbstractEvent;

@Data
@ToString
public class Signuped extends AbstractEvent {

    private String eventType = "Singuped";
    private Long userId;
    private String email;
}
