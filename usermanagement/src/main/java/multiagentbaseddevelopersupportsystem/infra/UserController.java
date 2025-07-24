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
// @RequestMapping(value="/users")
@Transactional
public class UserController {

    @Autowired
    UserRepository userRepository;

    @RequestMapping(
        value = "/users/signup",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public User signup(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody SignupCommand signupCommand
    ) throws Exception {
        System.out.println("##### /user/signup  called #####");
        User user = new User();
        user.signup(signupCommand);
        userRepository.save(user);
        return user;
    }

    @RequestMapping(
        value = "/users/login",
        method = RequestMethod.POST,
        produces = "application/json;charset=UTF-8"
    )
    public User login(
        HttpServletRequest request,
        HttpServletResponse response,
        @RequestBody LoginCommand loginCommand
    ) throws Exception {
        System.out.println("##### /user/login  called #####");
        User user = new User();
        user.login(loginCommand);
        userRepository.save(user);
        return user;
    }
}
//>>> Clean Arch / Inbound Adaptor
