package multiagentbaseddevelopersupportsystem.event;

import lombok.*;
import multiagentbaseddevelopersupportsystem.domain.User;
import multiagentbaseddevelopersupportsystem.infra.AbstractEvent;

@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Signuped extends AbstractEvent {

    private String eventType = "Signuped";
    private Long userId;
    private String email;

    public Signuped(User user) {
        super(user); // AbstractEvent에서 id 복사용
        this.userId = user.getUserId();
        this.email = user.getEmail();
    }
}
