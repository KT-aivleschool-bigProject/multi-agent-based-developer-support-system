package multiagentsystem.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import multiagentsystem.InvitemanagementApplication;
import multiagentsystem.domain.Teamapproved;

@Entity
@Table(name = "Invite_table")
@Data
//<<< DDD / Aggregate Root
public class Invite {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long inviteId;

    private Long projectId;

    private String email;

    private String status;

    private Long userId;

    public static InviteRepository repository() {
        InviteRepository inviteRepository = InvitemanagementApplication.applicationContext.getBean(
            InviteRepository.class
        );
        return inviteRepository;
    }

}
//>>> DDD / Aggregate Root
