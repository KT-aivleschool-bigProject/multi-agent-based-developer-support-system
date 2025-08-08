package multiagentbaseddevelopersupportsystem.infra;

import java.util.Optional;
import multiagentbaseddevelopersupportsystem.config.kafka.KafkaProcessor;
import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
public class InvitationManagementViewHandler {

    @Autowired
    private InvitationManagementRepository invitationManagementRepository;

    // Membersinvited 이벤트 수신
    @StreamListener(KafkaProcessor.INPUT)
    public void whenMembersinvited_then_CREATE(
        @Payload Membersinvited event
    ) {
        try {
            if (!event.validate()) return;

            // emails 리스트를 하나씩 꺼내서 각각 InvitationManagement로 저장
            for (String email : event.getMembersEmail()) {
                InvitationManagement invitation = new InvitationManagement();
                invitation.setProjectId(event.getProjectId());
                invitation.setEmail(email);
                invitation.setStatus("invited");

                invitationManagementRepository.save(invitation);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
