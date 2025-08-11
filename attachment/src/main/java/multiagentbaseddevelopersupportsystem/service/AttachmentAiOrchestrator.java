package multiagentbaseddevelopersupportsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import multiagentbaseddevelopersupportsystem.domain.Attachment;
import multiagentbaseddevelopersupportsystem.domain.AttachmentRepository;
import multiagentbaseddevelopersupportsystem.external.ai.AiAgentClient;
import multiagentbaseddevelopersupportsystem.external.ai.dto.AiGenerateRequest;
import multiagentbaseddevelopersupportsystem.external.ai.dto.AiGenerateResponse;
import multiagentbaseddevelopersupportsystem.external.post.PostClient;
import multiagentbaseddevelopersupportsystem.external.post.dto.SavePostCommand;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttachmentAiOrchestrator {

    private final AiAgentClient ai;
    private final PostClient postClient;
    private final AttachmentRepository attachmentRepository;
    private final AttachmentUrlBuilder urlBuilder;

    public AiGenerateResponse suggest(List<String> storedFilenames, List<String> fileUrls, String hint) {
        List<String> urls = buildUrls(storedFilenames, fileUrls);
        return ai.generateFromFiles(new AiGenerateRequest(0L, urls, hint));
    }

    @Transactional
    public Long autoPost(Long userId, Long projectId, List<String> storedFilenames, List<String> fileUrls, String hint) {
        List<String> urls = buildUrls(storedFilenames, fileUrls);

        // 1) AI 호출
        AiGenerateResponse gen = ai.generateFromFiles(new AiGenerateRequest(0L, urls, hint));

        // 2) Post init -> savepost
        Long postId = postClient.startPostWriting(userId);
        SavePostCommand cmd = new SavePostCommand(gen.getTitle(), gen.getContent());
        postClient.savePost(postId, cmd);

        // 3) 첨부 링크 (등록된 첨부가 있을 때만)
        if (storedFilenames != null && !storedFilenames.isEmpty()) {
            linkAttachmentsToPost(storedFilenames, postId);
        }
        return postId;
    }

    private List<String> buildUrls(List<String> storedFilenames, List<String> fileUrls) {
        List<String> urls = new ArrayList<>();
        if (storedFilenames != null && !storedFilenames.isEmpty()) {
            storedFilenames.forEach(fn -> urls.add(urlBuilder.downloadUrl(fn)));
        }
        if (fileUrls != null && !fileUrls.isEmpty()) {
            urls.addAll(fileUrls); // 등록 전 URL도 지원
        }
        return urls;
    }

    private void linkAttachmentsToPost(List<String> storedFilenames, Long postId) {
        List<Attachment> list = attachmentRepository.findByStoredNameIn(storedFilenames);
        for (Attachment a : list) {
            a.setPostId(postId);
            attachmentRepository.save(a);
        }
    }
}
