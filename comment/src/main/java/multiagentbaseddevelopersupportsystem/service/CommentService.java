package multiagentbaseddevelopersupportsystem.service;

import java.util.Date;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Comment;
import multiagentbaseddevelopersupportsystem.domain.CommentRepository;
import multiagentbaseddevelopersupportsystem.domain.EditCommentCommand;
import multiagentbaseddevelopersupportsystem.domain.WriteCommentCommand;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public Comment writeComment(WriteCommentCommand writeCommentCommand, Long userId) {
        Comment comment = Comment.builder()
                .content(writeCommentCommand.getContent())
                .postId(writeCommentCommand.getPostId())
                .userId(userId)
                .createdAt(new Date())
                .build();

        return commentRepository.save(comment);
    }

    public Comment editComment(Long commentId, EditCommentCommand editCommentCommand, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("댓글을 수정할 권한이 없습니다.");
        }

        comment.setContent(editCommentCommand.getContent());
        comment.setUpdatedAt(new Date());

        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("댓글을 삭제할 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId);
    }
}
