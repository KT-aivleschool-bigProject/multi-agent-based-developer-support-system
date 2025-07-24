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
// @RequestMapping(value="/comments")
@Transactional
public class CommentController {

    @Autowired
    CommentRepository commentRepository;

    @RequestMapping(
        value = "/comments/writecomment",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public Comment writeComment(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody WriteCommentCommand writeCommentCommand
    ) throws Exception {
        System.out.println("##### /comment/writeComment  called #####");
        Comment comment = new Comment();
        comment.writeComment(writeCommentCommand);
        commentRepository.save(comment);
        return comment;
    }

    @RequestMapping(
        value = "/comments/{id}/editcomment",
        method = RequestMethod.PUT,
        produces = "application/json;charset=UTF-8"
    )
    public Comment editComment(
        @PathVariable(value = "id") Long id,
        @RequestBody EditCommentCommand editCommentCommand,
        HttpServletRequest request,
        HttpServletResponse response
    ) throws Exception {
        System.out.println("##### /comment/editComment  called #####");
        Optional<Comment> optionalComment = commentRepository.findById(id);

        optionalComment.orElseThrow(() -> new Exception("No Entity Found"));
        Comment comment = optionalComment.get();
        comment.editComment(editCommentCommand);

        commentRepository.save(comment);
        return comment;
    }

    @RequestMapping(
        value = "/comments/{id}/deletecomment",
        method = RequestMethod.DELETE,
        produces = "application/json;charset=UTF-8"
    )
    public Comment deleteComment(
        @PathVariable(value = "id") Long id,
        HttpServletRequest request,
        HttpServletResponse response
    ) throws Exception {
        System.out.println("##### /comment/deleteComment  called #####");
        Optional<Comment> optionalComment = commentRepository.findById(id);

        optionalComment.orElseThrow(() -> new Exception("No Entity Found"));
        Comment comment = optionalComment.get();
        comment.deleteComment();

        commentRepository.delete(comment);
        return comment;
    }
}
//>>> Clean Arch / Inbound Adaptor
