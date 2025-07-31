package multiagentbaseddevelopersupportsystem.service;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Post;
import multiagentbaseddevelopersupportsystem.domain.PostRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    public Post startPostWriting(Long userId) {
        Post post = Post.builder()
            .title("")
            .content("")
            .viewCount(0)
            .userId(userId)
            .build();

        return postRepository.save(post);
    }
}
