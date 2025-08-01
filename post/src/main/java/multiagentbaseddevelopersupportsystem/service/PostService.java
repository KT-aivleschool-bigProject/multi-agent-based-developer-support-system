package multiagentbaseddevelopersupportsystem.service;

import java.util.Date;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Post;
import multiagentbaseddevelopersupportsystem.domain.PostDeleted;
import multiagentbaseddevelopersupportsystem.domain.PostRepository;
import multiagentbaseddevelopersupportsystem.domain.SavePostCommand;

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

    public Post savePost(Long postId, SavePostCommand savePostCommand) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("No Entity Found"));
        if(post.getCreatedAt() == null) {
            post.setCreatedAt(new Date());
        }
        post.setTitle(savePostCommand.getTitle());
        post.setContent(savePostCommand.getContent());

        return postRepository.save(post);
    }

    public void checkBeforeEditing(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("No Entity Found"));
        if (post.getUserId() != userId) {
            throw new RuntimeException("You are not authorized to edit this post.");
        }
    }

    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("No Entity Found"));
        
        // 관련 파일들 삭제
        // fileUploadService.getFilesByPostId(id).forEach(attachment -> {
        //     try {
        //         fileUploadService.deleteFile(attachment.getFileId());
        //     } catch (Exception e) {
        //         // 로그 처리
        //     }
        // });
        
        postRepository.delete(post);
        
        // PostDeleted 이벤트 발행 (댓글 자동 삭제)
        PostDeleted postDeleted = new PostDeleted(post);
        postDeleted.publishAfterCommit();
    }

	public Post getPost(Long id) {
		Post post = postRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("No Entity Found"));
		post.setViewCount(post.getViewCount() + 1);
		postRepository.save(post);
        return post;
	}

	public Page<Post> getPostList(Pageable pageable) {
		return postRepository.findAll(pageable);
	}

    public Page<Post> getPostListByKeyword(String searchKeyword, Pageable pageable) {
        if (searchKeyword == null || searchKeyword.isEmpty()) {
            return postRepository.findAll(pageable);
        }
        return postRepository.findByTitleContaining(searchKeyword, pageable);

    }
}
