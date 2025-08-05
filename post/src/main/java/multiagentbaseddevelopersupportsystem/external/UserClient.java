package multiagentbaseddevelopersupportsystem.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import multiagentbaseddevelopersupportsystem.domain.UserDto;

@FeignClient(name = "usermanagement", url = "localhost:8082")
public interface UserClient {
    
    @GetMapping("/users/{userId}")
    UserDto getUserById(@PathVariable("userId") Long userId);
}
