package multiagentbaseddevelopersupportsystem.external.attachment;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "attachmentClient", url = "${attachment.base-url}")
public interface AttachmentClient {
    @GetMapping("/attachments/post/{postId}")
    List<AttachmentDto> getFilesByPostId(@PathVariable("postId") Long postId);
}
