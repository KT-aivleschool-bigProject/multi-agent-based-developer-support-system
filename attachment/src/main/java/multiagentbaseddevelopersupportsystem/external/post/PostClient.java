package multiagentbaseddevelopersupportsystem.external.post;

import multiagentbaseddevelopersupportsystem.external.post.dto.SavePostCommand;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import multiagentbaseddevelopersupportsystem.config.FeignConfig;

@FeignClient(name = "postClient", url = "${post.base-url}", configuration = FeignConfig.class)
public interface PostClient {

    @PostMapping("/posts/init")
    Long startPostWriting(@RequestHeader("X-User-Id") Long userId);

    @PatchMapping("/posts/{id}/savepost")
    Long savePost(@PathVariable("id") Long id, @RequestBody SavePostCommand cmd);
}
