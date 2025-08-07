package multiagentsystem.service;

import lombok.RequiredArgsConstructor;
import multiagentsystem.domain.Invite;
import multiagentsystem.domain.Membersinvited;
import multiagentsystem.domain.Signuped;
import multiagentsystem.domain.Teamapproved;
import multiagentsystem.domain.InviteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InviteService {

    private final InviteRepository inviteRepository;

    // 팀 초대 이벤트 수신 → 초대 생성
    public void createInviteByProject(Membersinvited event) {
        if (event.getProjectId() == null || event.getMembersEmail() == null) return;
        //여러 개의 member의 email별 invite생성 로직
        for (String email : event.getMembersEmail()) {
            Invite invite = new Invite();
            invite.setProjectId(event.getProjectId());
            invite.setEmail(email);
            invite.setStatus("pending");

            inviteRepository.save(invite);
        }
    }

    // 사용자 가입 이벤트 수신 → 초대 확인 및 승인 이벤트 발행
    public void checkInviteBySignup(Signuped event) {
        if (event.getEmail() == null || event.getUserId() == null) return;

        List<Invite> invites = inviteRepository.findByEmail(event.getEmail());

        for (Invite invite : invites) {
            invite.setUserId(event.getUserId());
            invite.setStatus("accepted");
            inviteRepository.save(invite);

            Teamapproved teamapproved = new Teamapproved(invite);
            teamapproved.publishAfterCommit();
        }
    }
}
