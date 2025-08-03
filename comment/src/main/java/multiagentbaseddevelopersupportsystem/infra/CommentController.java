package multiagentbaseddevelopersupportsystem.infra;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Comment;
import multiagentbaseddevelopersupportsystem.domain.CommentResponseDto;
import multiagentbaseddevelopersupportsystem.domain.EditCommentCommand;
import multiagentbaseddevelopersupportsystem.domain.WriteCommentCommand;
import multiagentbaseddevelopersupportsystem.service.CommentService;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<Long> writeComment(
            @RequestBody WriteCommentCommand writeCommentCommand,
            @RequestHeader("X-User-Id") Long userId) {
                
        Long id = commentService.writeComment(writeCommentCommand, userId);
        return ResponseEntity.status(201).body(id);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Long> editComment(
            @PathVariable Long commentId,
            @RequestBody EditCommentCommand editCommentCommand,
            @RequestHeader("X-User-Id") Long userId) {

        Long id = commentService.editComment(commentId, editCommentCommand, userId);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") Long userId) {
        
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponseDto>> getCommentsByPostId(@PathVariable Long postId) {

        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }
}
