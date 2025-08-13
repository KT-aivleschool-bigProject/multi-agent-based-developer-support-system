package multiagentbaseddevelopersupportsystem.infra;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.naming.NameParser;
import javax.transaction.Transactional;
import multiagentbaseddevelopersupportsystem.config.kafka.KafkaProcessor;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.service.AttachmentService;

import org.apache.kafka.common.network.Send;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;


@Service
@Transactional
public class PolicyHandler {

    @Autowired
    AttachmentService attachmentService;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='PostDeleted'"
    )
    public void wheneverPostDeleted_DeleteAttachmentIncludedPost(
        @Payload PostDeleted postDeleted
    ) {
        PostDeleted event = postDeleted;
        System.out.println(
            "\n\n##### listener DeleteAttachmentIncludedPost : " +
            postDeleted +
            "\n\n"
        );

        Attachment.deleteAttachmentIncludedPost(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='ProjectCreated'"
    )
    public void wheneverProjectCreated_SendProjectAttachmentsToDocumentAgent(
        @Payload ProjectCreated projectCreated
    ) {
        ProjectCreated event = projectCreated;
        System.out.println(
            "\n\n##### listener SendProjectAttachmentsToDocumentAgent : " +
            projectCreated +
            "\n\n"
        );

        attachmentService.sendProjectAttachmentsToDocumentAgent(event);
    }

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='PostCreatedByAttachmentAgent'"
    )
    public void wheneverPostCreatedByAttachmentAgent_SendPostCreatedNotification(
        @Payload PostCreatedByAttachmentAgent postCreatedByAttachmentAgent
    ) {
        PostCreatedByAttachmentAgent event = postCreatedByAttachmentAgent;
        System.out.println(
            "\n\n##### listener SendPostCreatedNotification : " +
            postCreatedByAttachmentAgent +
            "\n\n"
        );

        attachmentService.updatePostIdInFile(event);
    }
}
