package multiagentsystem.infra;

import java.util.List; 
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import multiagentsystem.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

//<<< Clean Arch / Inbound Adaptor

@RestController
// @RequestMapping(value="/invites")
@Transactional
public class InviteController {

    @Autowired
    InviteRepository inviteRepository;
    
    //초대 생성 API
    @PostMapping("/invites")
    public Invite createInvite(@RequestBody Invite invite) {
        invite.setStatus("pending");
        return inviteRepository.save(invite);
    }

    //전체 초대 목록 조회 API
    @GetMapping("/invites")
    public List<Invite> getAllInvites() {
        return (List<Invite>) inviteRepository.findAll(); // 강제 캐스팅
    }

    //이메일 기준 초대 조회 API
    @GetMapping("/invites/search")
    public List<Invite> getInvitesByEmail(@RequestParam("email") String email) {
        return inviteRepository.findByEmail(email);
    }
}
//>>> Clean Arch / Inbound Adaptor
