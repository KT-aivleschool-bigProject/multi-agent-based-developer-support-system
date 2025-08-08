package multiagentbaseddevelopersupportsystem.infra;

import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class InviteHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<Invite>> {

    @Override
    public EntityModel<Invite> process(EntityModel<Invite> model) {
        return model;
    }
}
