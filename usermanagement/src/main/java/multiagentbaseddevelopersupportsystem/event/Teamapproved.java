package multiagentbaseddevelopersupportsystem.event;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

@Data
@ToString
@NoArgsConstructor
public class Teamapproved extends AbstractEvent {

    private Long userId;
    private Long projectId;

    public Teamapproved(Long userId, Long projectId) {
        super();
        this.userId = userId;
        this.projectId = projectId;
    }
}
