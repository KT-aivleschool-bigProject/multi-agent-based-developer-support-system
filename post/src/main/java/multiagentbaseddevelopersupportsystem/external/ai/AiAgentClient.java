package multiagentbaseddevelopersupportsystem.external.ai;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "aiAgentClient", url = "${aiagent.base-url}")
public interface AiAgentClient {
    @PostMapping("/generate-from-files")
    AiGenerateResponse generateFromFiles(@RequestBody AiGenerateRequest request);
}
