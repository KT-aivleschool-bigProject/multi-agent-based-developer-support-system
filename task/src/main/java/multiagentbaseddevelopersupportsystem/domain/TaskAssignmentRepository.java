package multiagentbaseddevelopersupportsystem.domain;

import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(
    collectionResourceRel = "taskAssignments",
    path = "taskAssignments"
)
public interface TaskAssignmentRepository
    extends PagingAndSortingRepository<TaskAssignment, Long> {}
