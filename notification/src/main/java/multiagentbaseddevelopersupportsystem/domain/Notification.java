package multiagentbaseddevelopersupportsystem.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import multiagentbaseddevelopersupportsystem.NotificationApplication;
import multiagentbaseddevelopersupportsystem.domain.DeadlineApproaching;
import multiagentbaseddevelopersupportsystem.domain.ScheduleSuggested;
import multiagentbaseddevelopersupportsystem.domain.TaskAssigned;

@Entity
@Table(name = "Notification_table")
@Data
//<<< DDD / Aggregate Root
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String notificationId;

    private String targetUser;

    private String content;

    private String deliveryTime;

    @PostPersist
    public void onPostPersist() {
        DeadlineApproaching deadlineApproaching = new DeadlineApproaching(this);
        deadlineApproaching.publishAfterCommit();

        ScheduleSuggested scheduleSuggested = new ScheduleSuggested(this);
        scheduleSuggested.publishAfterCommit();

        TaskAssigned taskAssigned = new TaskAssigned(this);
        taskAssigned.publishAfterCommit();
    }

    public static NotificationRepository repository() {
        NotificationRepository notificationRepository = NotificationApplication.applicationContext.getBean(
            NotificationRepository.class
        );
        return notificationRepository;
    }
}
//>>> DDD / Aggregate Root
