package multiagentbaseddevelopersupportsystem.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import multiagentbaseddevelopersupportsystem.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//<<< Clean Arch / Inbound Adaptor

@RestController
// @RequestMapping(value="/posts")
@Transactional
public class PostController {

    @Autowired
    PostRepository postRepository;

    @RequestMapping(
        value = "/posts/{id}/savepost",
        method = RequestMethod.PUT,
        produces = "application/json;charset=UTF-8"
    )
    public Post savePost(
        @PathVariable(value = "id") Long id,
        @RequestBody SavePostCommand savePostCommand,
        HttpServletRequest request,
        HttpServletResponse response
    ) throws Exception {
        System.out.println("##### /post/savePost  called #####");
        Optional<Post> optionalPost = postRepository.findById(id);

        optionalPost.orElseThrow(() -> new Exception("No Entity Found"));
        Post post = optionalPost.get();
        post.savePost(savePostCommand);

        postRepository.save(post);
        return post;
    }

    @RequestMapping(
        value = "/posts/{id}/deletepost",
        method = RequestMethod.DELETE,
        produces = "application/json;charset=UTF-8"
    )
    public Post deletePost(
        @PathVariable(value = "id") Long id,
        HttpServletRequest request,
        HttpServletResponse response
    ) throws Exception {
        System.out.println("##### /post/deletePost  called #####");
        Optional<Post> optionalPost = postRepository.findById(id);

        optionalPost.orElseThrow(() -> new Exception("No Entity Found"));
        Post post = optionalPost.get();
        post.deletePost();

        postRepository.delete(post);
        return post;
    }

    @RequestMapping(
        value = "/posts/{id}/increaseviewcount",
        method = RequestMethod.PUT,
        produces = "application/json;charset=UTF-8"
    )
    public Post increaseViewCount(
        @PathVariable(value = "id") Long id,
        HttpServletRequest request,
        HttpServletResponse response
    ) throws Exception {
        System.out.println("##### /post/increaseViewCount  called #####");
        Optional<Post> optionalPost = postRepository.findById(id);

        optionalPost.orElseThrow(() -> new Exception("No Entity Found"));
        Post post = optionalPost.get();
        post.increaseViewCount();

        postRepository.save(post);
        return post;
    }

    @RequestMapping(
        value = "/posts/{id}/editpost",
        method = RequestMethod.PUT,
        produces = "application/json;charset=UTF-8"
    )
    public Post editPost(
        @PathVariable(value = "id") Long id,
        @RequestBody EditPostCommand editPostCommand,
        HttpServletRequest request,
        HttpServletResponse response
    ) throws Exception {
        System.out.println("##### /post/editPost  called #####");
        Optional<Post> optionalPost = postRepository.findById(id);

        optionalPost.orElseThrow(() -> new Exception("No Entity Found"));
        Post post = optionalPost.get();
        post.editPost(editPostCommand);

        postRepository.save(post);
        return post;
    }
}
//>>> Clean Arch / Inbound Adaptor
