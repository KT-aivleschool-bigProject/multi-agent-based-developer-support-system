package multiagentbaseddevelopersupportsystem.infra;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.naming.NameParser;
import javax.naming.NameParser;
import javax.transaction.Transactional;
import multiagentbaseddevelopersupportsystem.config.kafka.KafkaProcessor;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.service.PostService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class PolicyHandler {

    @Autowired
    PostService postService;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='ProjectAttachmentAutoCreated'"
    )
    public void wheneverProjectAttachmentAutoCreated_ProjectAttachmentAutoCreated(
        @Payload ProjectAttachmentAutoCreated projectAttachmentAutoCreated
    ) {
        ProjectAttachmentAutoCreated event = projectAttachmentAutoCreated;
        System.out.println(
            "\n\n##### listener ProjectAttachmentAutoCreated : " +
            projectAttachmentAutoCreated +
            "\n\n"
        );

        postService.createPostIncludingProjectAttachment(event);
    }
}

