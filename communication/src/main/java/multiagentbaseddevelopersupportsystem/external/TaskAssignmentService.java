package multiagentbaseddevelopersupportsystem.external;

import java.util.Date;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@FeignClient(name = "task", url = "${api.url.task}")
public interface TaskAssignmentService {
    @RequestMapping(method = RequestMethod.POST, path = "/taskAssignments")
    public void createTask(@RequestBody TaskAssignment taskAssignment);
}
