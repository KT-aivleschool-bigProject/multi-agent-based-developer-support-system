package multiagentbaseddevelopersupportsystem.infra;

import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class ProjectManagementHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<ProjectManagement>> {

    @Override
    public EntityModel<ProjectManagement> process(
        EntityModel<ProjectManagement> model
    ) {
        model.add(
            Link
                .of(model.getRequiredLink("self").getHref() + "/createproject")
                .withRel("createproject")
        );
        model.add(
            Link
                .of(
                    model.getRequiredLink("self").getHref() +
                    "/addteammemberwithid"
                )
                .withRel("addteammemberwithid")
        );

        return model;
    }
}
