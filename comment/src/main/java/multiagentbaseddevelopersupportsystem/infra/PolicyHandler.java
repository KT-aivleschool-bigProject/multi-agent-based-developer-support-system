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
    CommentRepository commentRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whatever(@Payload String eventString) {}

    @StreamListener(
        value = KafkaProcessor.INPUT,
        condition = "headers['type']=='PostDeleted'"
    )
    public void wheneverPostDeleted_DeleteCommentIncludedPost(
        @Payload PostDeleted postDeleted
    ) {
        PostDeleted event = postDeleted;
        System.out.println(
            "\n\n##### listener DeleteCommentIncludedPost : " +
            postDeleted +
            "\n\n"
        );

        // Sample Logic //
        Comment.deleteCommentIncludedPost(event);
    }
}
//>>> Clean Arch / Inbound Adaptor
