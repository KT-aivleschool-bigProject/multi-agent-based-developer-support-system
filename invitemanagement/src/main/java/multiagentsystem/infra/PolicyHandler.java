package multiagentsystem.infra;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.transaction.Transactional;
import java.util.Map;

import multiagentsystem.config.kafka.KafkaProcessor;
import multiagentsystem.domain.Membersinvited;
import multiagentsystem.domain.Signuped;
import multiagentsystem.service.InviteService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.messaging.handler.annotation.Headers;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class PolicyHandler {

    @Autowired
    private InviteService inviteService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @StreamListener(KafkaProcessor.INPUT)
    public void handleAll(@Payload String payload, @Headers Map<String, Object> headers) {
        try {
            // Step 1: 헤더에서 type 추출
            String eventType = null;
            Object typeHeader = headers.get("type");
            if (typeHeader instanceof byte[]) {
                eventType = new String((byte[]) typeHeader);
            } else if (typeHeader instanceof String) {
                eventType = (String) typeHeader;
            }

            // Step 2: fallback - payload에서 eventType 추출
            JsonNode root = objectMapper.readTree(payload);
            if (eventType == null && root.has("eventType")) {
                eventType = root.get("eventType").asText();
            }

            // Step 3: 이벤트 분기 처리
            if ("Membersinvited".equals(eventType)) {
                Membersinvited event = objectMapper.treeToValue(root, Membersinvited.class);
                System.out.println("[Invite] Membersinvited 수신 : " + event);
                inviteService.createInviteByProject(event);

            } else if ("Signuped".equals(eventType)) {
                Signuped event = objectMapper.treeToValue(root, Signuped.class);
                System.out.println("[Invite] Signuped 수신 : " + event);
                inviteService.checkInviteBySignup(event);

            } else {
                System.out.println("[Invite] 알 수 없는 이벤트 타입 수신: " + eventType);
            }

        } catch (Exception e) {
            System.err.println("[Invite] 이벤트 처리 중 예외 발생");
            e.printStackTrace();
        }
    }
}
