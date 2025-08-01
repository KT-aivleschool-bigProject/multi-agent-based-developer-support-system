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
    public ResponseEntity<Long> startPostWriting(@RequestHeader("X-User-Id") Long userId) {
        Post post = postService.startPostWriting(userId);
        return ResponseEntity.ok(post.getPostId());
    }   

    @PatchMapping("/{id}/savepost")
    public ResponseEntity<Post> savePost(@PathVariable(value = "id") Long id, @RequestBody SavePostCommand savePostCommand) {
        Post post = postService.savePost(id, savePostCommand);
        return ResponseEntity.ok(post);
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
    public ResponseEntity<Post> getPost(@PathVariable(value = "id") Long id) {
        Post post = postService.getPost(id);
        return ResponseEntity.ok(post);
    }

    @GetMapping("/list")
    public ResponseEntity<Page<Post>> getPostList(@PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable,
                                                    @RequestParam(required = false) String searchKeyword) {
        Page<Post> list = null;
        
        if(searchKeyword != null && !searchKeyword.isEmpty()) {
            list = postService.getPostListByKeyword(searchKeyword, pageable);
        } else {
            list = postService.getPostList(pageable);
        }

        return ResponseEntity.ok(list);
    }
}
