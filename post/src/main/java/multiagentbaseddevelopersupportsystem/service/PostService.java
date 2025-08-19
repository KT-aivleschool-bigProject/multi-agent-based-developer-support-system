package multiagentbaseddevelopersupportsystem.service;

import java.util.Date;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Post;
import multiagentbaseddevelopersupportsystem.domain.PostCreatedByAttachmentAgent;
import multiagentbaseddevelopersupportsystem.domain.PostDeleted;
import multiagentbaseddevelopersupportsystem.domain.PostRepository;
import multiagentbaseddevelopersupportsystem.domain.PostResponseDto;
import multiagentbaseddevelopersupportsystem.domain.PostStatus;
import multiagentbaseddevelopersupportsystem.domain.ProjectAttachmentAutoCreated;
import multiagentbaseddevelopersupportsystem.domain.SavePostCommand;
import multiagentbaseddevelopersupportsystem.domain.UserDto;
import multiagentbaseddevelopersupportsystem.external.UserClient;

@Service
@Transactional
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    public Long startPostWriting(Long userId) {
        Post post = Post.builder()
            .title("")
            .content("")
            .viewCount(0)
            .userId(userId)
            .status(PostStatus.DRAFT)
            .build();

        return postRepository.save(post).getPostId();
    }

    public void cancelPostWriting(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        
        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("게시글을 취소할 권한이 없습니다.");
        }
        
        if (post.getStatus() == PostStatus.DRAFT) {
            postRepository.delete(post);
        }
    }

    public Long savePost(Long postId, SavePostCommand savePostCommand) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("No Entity Found"));
        if(post.getCreatedAt() == null) {
            post.setCreatedAt(new Date());
        }
        post.setTitle(savePostCommand.getTitle());
        post.setContent(savePostCommand.getContent());
        post.setStatus(PostStatus.PUBLISHED);
        return postRepository.save(post).getPostId();
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
        
        postRepository.delete(post);
        
        // PostDeleted 이벤트 발행 (댓글 자동 삭제)
        PostDeleted postDeleted = new PostDeleted(post);
        postDeleted.publishAfterCommit();
    }

	public PostResponseDto getPost(Long id) {
		Post post = postRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("No Entity Found"));
		post.setViewCount(post.getViewCount() + 1);

        return postRepository.save(post).toDto();
	}

	public Page<PostResponseDto> getPostList(Pageable pageable) {
		Page<Post> postPage = postRepository.findAll(pageable);
		return postPage.map(Post::toDto);
	}

    public Page<PostResponseDto> getPostListByKeyword(String searchKeyword, Pageable pageable) {
        if (searchKeyword == null || searchKeyword.isEmpty()) {
            return postRepository.findAll(pageable).map(Post::toDto);
        }
        return postRepository.findByTitleContaining(searchKeyword, pageable).map(Post::toDto);
    }

    public void createPostIncludingProjectAttachment(ProjectAttachmentAutoCreated event) {
        Post post = Post.builder()
            .title(event.getTitle())
            .content(event.getContent())
            .viewCount(0)
            .userId(null)
            .status(PostStatus.PUBLISHED)
            .createdAt(new Date())
            .build();
        Long postId = postRepository.save(post).getPostId();
        PostCreatedByAttachmentAgent postCreatedByAttachmentAgent = new PostCreatedByAttachmentAgent();
        postCreatedByAttachmentAgent.setPostId(postId);
        postCreatedByAttachmentAgent.setFileId(event.getFileId());
        postCreatedByAttachmentAgent.publishAfterCommit();
    }
}
