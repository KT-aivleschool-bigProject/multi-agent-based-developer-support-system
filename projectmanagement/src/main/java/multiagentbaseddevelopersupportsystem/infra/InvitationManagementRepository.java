package multiagentbaseddevelopersupportsystem.infra;

import java.util.List;
import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(
    collectionResourceRel = "invitationManagements",
    path = "invitationManagements"
)
public interface InvitationManagementRepository
    extends PagingAndSortingRepository<InvitationManagement, Long> {}
