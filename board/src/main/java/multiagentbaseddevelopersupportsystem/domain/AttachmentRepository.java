package multiagentbaseddevelopersupportsystem.domain;

import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(
    collectionResourceRel = "attachments",
    path = "attachments"
)
public interface AttachmentRepository
    extends PagingAndSortingRepository<Attachment, Long> {}
