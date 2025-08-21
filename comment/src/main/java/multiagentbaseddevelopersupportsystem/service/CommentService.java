package multiagentbaseddevelopersupportsystem.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Comment;
import multiagentbaseddevelopersupportsystem.domain.CommentRepository;
import multiagentbaseddevelopersupportsystem.domain.CommentResponseDto;
import multiagentbaseddevelopersupportsystem.domain.EditCommentCommand;
import multiagentbaseddevelopersupportsystem.domain.UserDto;
import multiagentbaseddevelopersupportsystem.domain.WriteCommentCommand;
import multiagentbaseddevelopersupportsystem.external.UserClient;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserClient userClient;

    public Long writeComment(WriteCommentCommand writeCommentCommand, Long userId) {
        Comment comment = Comment.builder()
                .content(writeCommentCommand.getContent())
                .postId(writeCommentCommand.getPostId())
                .userId(userId)
                .build();

        return commentRepository.save(comment).getCommentId();
    }

    public Long editComment(Long commentId, EditCommentCommand editCommentCommand, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("댓글을 수정할 권한이 없습니다.");
        }

        comment.setContent(editCommentCommand.getContent());

        return commentRepository.save(comment).getCommentId();
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("댓글을 삭제할 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }

    public List<CommentResponseDto> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);

        return comments.stream()
                .map(comment -> {
                    // UserClient를 통해 사용자 정보 조회
                    UserDto user = userClient.getUserById(comment.getUserId());
                    
                    return CommentResponseDto.builder()
                            .commentId(comment.getCommentId())
                            .content(comment.getContent())
                            .createdAt(comment.getCreatedAt())
                            .updatedAt(comment.getUpdatedAt())
                            .postId(comment.getPostId())
                            .userName(user.getName()) // 실제 userName 설정
                            .build();
                })
                .collect(Collectors.toList());
    }
}
