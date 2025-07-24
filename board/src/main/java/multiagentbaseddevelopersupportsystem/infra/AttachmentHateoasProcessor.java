package multiagentbaseddevelopersupportsystem.infra;

import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class AttachmentHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<Attachment>> {

    @Override
    public EntityModel<Attachment> process(EntityModel<Attachment> model) {
        return model;
    }
}
