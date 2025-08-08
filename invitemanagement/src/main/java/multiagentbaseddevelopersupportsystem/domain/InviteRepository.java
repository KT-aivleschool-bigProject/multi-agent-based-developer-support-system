package multiagentbaseddevelopersupportsystem.domain;

import multiagentbaseddevelopersupportsystem.domain.*;
import java.util.List; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

//<<< PoEAA / Repository
@RepositoryRestResource(collectionResourceRel = "invites", path = "invites")
public interface InviteRepository extends JpaRepository<Invite, Long> {
    List<Invite> findByEmail(String email);
}
