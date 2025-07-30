package multiagentbaseddevelopersupportsystem.service;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {
    public Post startPostWriting() {
        // Logic to start post writing
        Post post = new Post();
        // Initialize post with default values if necessary
        return post;
    }
}
