package multiagentbaseddevelopersupportsystem.infra;

import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.RepresentationModelProcessor;
import org.springframework.stereotype.Component;

@Component
public class CalendarHateoasProcessor
    implements RepresentationModelProcessor<EntityModel<Calendar>> {

    @Override
    public EntityModel<Calendar> process(EntityModel<Calendar> model) {
        return model;
    }
}
