package multiagentbaseddevelopersupportsystem.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import multiagentbaseddevelopersupportsystem.TaskApplication;
import multiagentbaseddevelopersupportsystem.domain.TaskAssigned;
import multiagentbaseddevelopersupportsystem.domain.TaskCompleted;
import multiagentbaseddevelopersupportsystem.domain.TaskCreated;
import multiagentbaseddevelopersupportsystem.domain.TaskRejected;

@Entity
@Table(name = "TaskAssignment_table")
@Data
//<<< DDD / Aggregate Root
public class TaskAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String taskId;

    private String title;

    private String description;

    private String assignmentAgentId;

    private String status;

    @PostPersist
    public void onPostPersist() {
        TaskCreated taskCreated = new TaskCreated(this);
        taskCreated.publishAfterCommit();

        TaskAssigned taskAssigned = new TaskAssigned(this);
        taskAssigned.publishAfterCommit();

        TaskRejected taskRejected = new TaskRejected(this);
        taskRejected.publishAfterCommit();

        TaskCompleted taskCompleted = new TaskCompleted(this);
        taskCompleted.publishAfterCommit();
    }

    public static TaskAssignmentRepository repository() {
        TaskAssignmentRepository taskAssignmentRepository = TaskApplication.applicationContext.getBean(
            TaskAssignmentRepository.class
        );
        return taskAssignmentRepository;
    }
}
//>>> DDD / Aggregate Root
