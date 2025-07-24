package multiagentbaseddevelopersupportsystem.domain;

import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "calendars", path = "calendars")
public interface CalendarRepository
    extends PagingAndSortingRepository<Calendar, Long> {}
