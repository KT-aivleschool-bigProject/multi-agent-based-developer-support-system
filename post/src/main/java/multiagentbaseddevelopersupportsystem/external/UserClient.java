package multiagentbaseddevelopersupportsystem.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import multiagentbaseddevelopersupportsystem.domain.UserDto;

@FeignClient(name = "usermanagement", url = "usermanagement:8080")
public interface UserClient {
    
    @GetMapping("/users/{userId}")
    UserDto getUserById(@PathVariable("userId") Long userId);
}
