package multiagentbaseddevelopersupportsystem.infra;

import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.service.PostService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(value="/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping("/init")
    public ResponseEntity<Long> startPostWriting(@RequestHeader("X-User-Id") Long userId, @RequestParam Long projectId) {
        Long postId = postService.startPostWriting(userId, projectId);
        return ResponseEntity.status(201).body(postId);
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelPostWriting(@RequestHeader("X-User-Id") Long userId, 
                                                @PathVariable(value = "id") Long postId) {
        postService.cancelPostWriting(userId, postId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/savepost")
    public ResponseEntity<Long> savePost(@PathVariable(value = "id") Long id, @RequestBody SavePostCommand savePostCommand) {
        Long postId = postService.savePost(id, savePostCommand);
        return ResponseEntity.ok(postId);
    }

    @GetMapping("/{id}/checkBeforeEditing")
    public ResponseEntity<Void> checkBeforeEditing(@RequestHeader("X-User-Id") Long userId, @PathVariable(value = "id") Long postId) {
        postService.checkBeforeEditing(userId, postId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/deletepost")
    public ResponseEntity<Void> deletePost(@PathVariable(value = "id") Long id)  {
        postService.deletePost(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDto> getPost(@PathVariable(value = "id") Long id) {
        PostResponseDto postResponseDto = postService.getPost(id);
        return ResponseEntity.ok(postResponseDto);
    }

    @GetMapping("/list")
    public ResponseEntity<Page<PostResponseDto>> getPostList(@PageableDefault(page = 0, size = 10, sort = "postId", direction = Sort.Direction.DESC) Pageable pageable,
                                                    @RequestParam(value = "projectId") Long projectId,
                                                    @RequestParam(required = false) String searchKeyword) {
        Page<PostResponseDto> list = null;

        if(searchKeyword != null && !searchKeyword.isEmpty()) {
            list = postService.getPostListByKeyword(projectId, searchKeyword, pageable);
        } else {
            list = postService.getPostList(projectId, pageable);
        }

        return ResponseEntity.ok(list);
    }
}
