package multiagentbaseddevelopersupportsystem.domain;

import java.util.Date;
import java.util.List;
import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(
    collectionResourceRel = "projectManagements",
    path = "projectManagements"
)
public interface ProjectManagementRepository
    extends PagingAndSortingRepository<ProjectManagement, Long> {}
