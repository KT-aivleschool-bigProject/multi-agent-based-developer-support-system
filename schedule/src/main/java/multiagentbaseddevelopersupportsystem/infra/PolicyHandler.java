package multiagentbaseddevelopersupportsystem.infra;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.naming.NameParser;
import javax.naming.NameParser;
import javax.transaction.Transactional;
import multiagentbaseddevelopersupportsystem.config.kafka.KafkaProcessor;
import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

//<<< Clean Arch / Inbound Adaptor
@Service
@Transactional
public class PolicyHandler {

    @Autowired
    CalendarRepository calendarRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='TaskAssigned'"
    )
    public void wheneverTaskAssigned_TaskAssign(
        @Payload TaskAssigned taskAssigned
    ) {
        TaskAssigned event = taskAssigned;
        System.out.println(
            "\n\n##### listener TaskAssign : " + taskAssigned + "\n\n"
        );

        // Sample Logic //

        AddCalendarCommand command = new AddCalendarCommand();
        Calendar.addCalendar(command);
    }
}
//>>> Clean Arch / Inbound Adaptor
