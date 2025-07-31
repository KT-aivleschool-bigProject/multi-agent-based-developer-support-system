package multiagentbaseddevelopersupportsystem.infra;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Comment;
import multiagentbaseddevelopersupportsystem.domain.EditCommentCommand;
import multiagentbaseddevelopersupportsystem.domain.WriteCommentCommand;
import multiagentbaseddevelopersupportsystem.service.CommentService;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<Comment> writeComment(
            @RequestBody WriteCommentCommand writeCommentCommand,
            @RequestHeader("X-User-Id") Long userId) {
        
        Comment comment = commentService.writeComment(writeCommentCommand, userId);
        return ResponseEntity.ok(comment);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> editComment(
            @PathVariable Long commentId,
            @RequestBody EditCommentCommand editCommentCommand,
            @RequestHeader("X-User-Id") Long userId) {
        
        Comment comment = commentService.editComment(commentId, editCommentCommand, userId);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") Long userId) {
        
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable Long postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }
}
