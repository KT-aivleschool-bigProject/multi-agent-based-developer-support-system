package multiagentbaseddevelopersupportsystem.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import multiagentbaseddevelopersupportsystem.ScheduleApplication;
import multiagentbaseddevelopersupportsystem.domain.AddedCalendar;
import multiagentbaseddevelopersupportsystem.domain.ScheduleConflictDetected;
import multiagentbaseddevelopersupportsystem.domain.ScheduleSuggested;

@Entity
@Table(name = "Calendar_table")
@Data
//<<< DDD / Aggregate Root
public class Calendar {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String calendarId;

    private String taskId;

    private String agentId;

    private String startTime;

    private String endTime;

    private String status;

    @PostPersist
    public void onPostPersist() {
        AddedCalendar addedCalendar = new AddedCalendar(this);
        addedCalendar.publishAfterCommit();

        ScheduleConflictDetected scheduleConflictDetected = new ScheduleConflictDetected(
            this
        );
        scheduleConflictDetected.publishAfterCommit();

        ScheduleSuggested scheduleSuggested = new ScheduleSuggested(this);
        scheduleSuggested.publishAfterCommit();
    }

    public static CalendarRepository repository() {
        CalendarRepository calendarRepository = ScheduleApplication.applicationContext.getBean(
            CalendarRepository.class
        );
        return calendarRepository;
    }
}
//>>> DDD / Aggregate Root
