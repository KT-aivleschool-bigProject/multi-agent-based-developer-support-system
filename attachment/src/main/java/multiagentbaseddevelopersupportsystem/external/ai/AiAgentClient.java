package multiagentbaseddevelopersupportsystem.external.ai;

import multiagentbaseddevelopersupportsystem.external.ai.dto.AiGenerateRequest;
import multiagentbaseddevelopersupportsystem.external.ai.dto.AiGenerateResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import multiagentbaseddevelopersupportsystem.config.FeignConfig;

@FeignClient(name = "aiAgentClient", url = "${aiagent.base-url}", configuration = FeignConfig.class)
public interface AiAgentClient {
    @PostMapping("/generate-from-files")
    AiGenerateResponse generateFromFiles(@RequestBody AiGenerateRequest request);
}
