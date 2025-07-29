package multiagentbaseddevelopersupportsystem.infra;

import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class TaskAssignmentHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<TaskAssignment>> {

    @Override
    public EntityModel<TaskAssignment> process(
        EntityModel<TaskAssignment> model
    ) {
        return model;
    }
}
