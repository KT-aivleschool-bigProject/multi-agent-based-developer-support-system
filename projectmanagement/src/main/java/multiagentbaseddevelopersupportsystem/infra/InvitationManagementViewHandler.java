package multiagentbaseddevelopersupportsystem.infra;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import multiagentbaseddevelopersupportsystem.config.kafka.KafkaProcessor;
import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
public class InvitationManagementViewHandler {

    //<<< DDD / CQRS
    @Autowired
    private InvitationManagementRepository invitationManagementRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void whenMemberIdInvited_then_CREATE_1(
        @Payload MemberIdInvited memberIdInvited
    ) {
        try {
            if (!memberIdInvited.validate()) return;

            // view 객체 생성
            InvitationManagement invitationManagement = new InvitationManagement();
            // view 객체에 이벤트의 Value 를 set 함
            // view 레파지 토리에 save
            invitationManagementRepository.save(invitationManagement);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @StreamListener(KafkaProcessor.INPUT)
    public void whenProjectInvitationAccepted_then_UPDATE_1(
        @Payload ProjectInvitationAccepted projectInvitationAccepted
    ) {
        try {
            if (!projectInvitationAccepted.validate()) return;
            // view 객체 조회

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    //>>> DDD / CQRS
}
