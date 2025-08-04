package multiagentbaseddevelopersupportsystem.infra;

import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class CommentHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<Comment>> {

    @Override
    public EntityModel<Comment> process(EntityModel<Comment> model) {
        model.add(
            Link
                .of(model.getRequiredLink("self").getHref() + "/writecomment")
                .withRel("writecomment")
        );
        model.add(
            Link
                .of(model.getRequiredLink("self").getHref() + "/editcomment")
                .withRel("editcomment")
        );
        model.add(
            Link
                .of(model.getRequiredLink("self").getHref() + "/deletecomment")
                .withRel("deletecomment")
        );

        return model;
    }
}
