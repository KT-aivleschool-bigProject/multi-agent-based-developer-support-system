package multiagentbaseddevelopersupportsystem.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import javax.validation.Valid;

import multiagentbaseddevelopersupportsystem.domain.*;
import multiagentbaseddevelopersupportsystem.service.PostService;

import org.springframework.beans.factory.annotation.Autowired;
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
    public Post savePost(@PathVariable(value = "id") Long id, @RequestBody SavePostCommand savePostCommand) throws Exception {
        Optional<Post> optionalPost = postRepository.findById(id);

        optionalPost.orElseThrow(() -> new Exception("No Entity Found"));
        Post post = optionalPost.get();
        post.savePost(savePostCommand);

        postRepository.save(post);
        return post;
    }

    // @RequestMapping(
    //     value = "/{id}/deletepost",
    //     method = RequestMethod.DELETE,
    //     produces = "application/json;charset=UTF-8"
    // )
    // public Post deletePost(
    //     @PathVariable(value = "id") Long id,
    //     HttpServletRequest request,
    //     HttpServletResponse response
    // ) throws Exception {
    //     System.out.println("##### /post/deletePost  called #####");
    //     Optional<Post> optionalPost = postRepository.findById(id);

    //     optionalPost.orElseThrow(() -> new Exception("No Entity Found"));
    //     Post post = optionalPost.get();
    //     post.deletePost();

    //     postRepository.delete(post);
    //     return post;
    // }

    // @RequestMapping(
    //     value = "/{id}/increaseviewcount",
    //     method = RequestMethod.PUT,
    //     produces = "application/json;charset=UTF-8"
    // )
    // public Post increaseViewCount(
    //     @PathVariable(value = "id") Long id,
    //     HttpServletRequest request,
    //     HttpServletResponse response
    // ) throws Exception {
    //     System.out.println("##### /post/increaseViewCount  called #####");
    //     Optional<Post> optionalPost = postRepository.findById(id);

    //     optionalPost.orElseThrow(() -> new Exception("No Entity Found"));
    //     Post post = optionalPost.get();
    //     post.increaseViewCount();

    //     postRepository.save(post);
    //     return post;
    // }

    // @RequestMapping(
    //     value = "/{id}/editpost",
    //     method = RequestMethod.PUT,
    //     produces = "application/json;charset=UTF-8"
    // )
    // public Post editPost(
    //     @PathVariable(value = "id") Long id,
    //     @RequestBody EditPostCommand editPostCommand,
    //     HttpServletRequest request,
    //     HttpServletResponse response
    // ) throws Exception {
    //     System.out.println("##### /post/editPost  called #####");
    //     Optional<Post> optionalPost = postRepository.findById(id);

    //     optionalPost.orElseThrow(() -> new Exception("No Entity Found"));
    //     Post post = optionalPost.get();
    //     post.editPost(editPostCommand);

    //     postRepository.save(post);
    //     return post;
    // }
}
