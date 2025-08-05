package multiagentbaseddevelopersupportsystem.infra;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

import javax.naming.NameParser;
import javax.naming.NameParser;
import javax.transaction.Transactional;
import multiagentbaseddevelopersupportsystem.config.kafka.KafkaProcessor;
import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.event.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

//<<< Clean Arch / Inbound Adaptor
@Service
@Transactional
@Slf4j
public class PolicyHandler {

    @Autowired
    UserRepository userRepository;

    @StreamListener(KafkaProcessor.INPUT)
    public void wheneverTeamapproved_addProjectId(@Payload Teamapproved event) {
        if (!event.validate()) return;
        
        log.info("[Teamapproved 수신] userId={}, projectId={}", event.getUserId(), event.getProjectId());

        userRepository.findById(event.getUserId()).ifPresent(user -> {
            user.setProjectId(event.getProjectId());
            userRepository.save(user);
            log.info("✅ [ProjectId 갱신 완료] userId={} → projectId={}", user.getUserId(), user.getProjectId());
        });
    }
}
//>>> Clean Arch / Inbound Adaptor
