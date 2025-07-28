// package multiagentbaseddevelopersupportsystem.infra;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import multiagentbaseddevelopersupportsystem.domain.LoginCommand;
// import multiagentbaseddevelopersupportsystem.domain.SignupCommand;
// import multiagentbaseddevelopersupportsystem.domain.User;
// import multiagentbaseddevelopersupportsystem.domain.AuthRepository;
// import multiagentbaseddevelopersupportsystem.security.JwtTokenProvider;

// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.boot.test.mock.mockito.MockBean;
// import org.springframework.http.MediaType;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.test.web.servlet.MockMvc;

// import static org.assertj.core.api.Assertions.assertThat;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @SpringBootTest
// @AutoConfigureMockMvc
// class UserControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private AuthRepository userRepository;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @Autowired
//     private BCryptPasswordEncoder passwordEncoder;

//     // ✅ JwtTokenProvider는 Security 필터에서 의존하는데,
//     // 테스트에서는 검증 대상이 아니므로 Mock 처리
//     @MockBean
//     private JwtTokenProvider jwtTokenProvider;

//     @BeforeEach
//     void setUp() {
//         userRepository.deleteAll();
//     }

//     @Test
//     @DisplayName("회원가입 성공")
//     void signup_success() throws Exception {
//         SignupCommand command = new SignupCommand();
//         command.setEmail("test@example.com");
//         command.setPassword("password123");
//         command.setName("tester");

//         mockMvc.perform(post("/api/auth/signup")
//                 .contentType(MediaType.APPLICATION_JSON)
//                 .content(objectMapper.writeValueAsString(command)))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.success").doesNotExist())
//                 .andExpect(jsonPath("$.email").value("test@example.com"));

//         User user = userRepository.findByEmail("test@example.com").orElse(null);
//         assertThat(user).isNotNull();
//         assertThat(passwordEncoder.matches("password123", user.getPassword())).isTrue();
//     }

//     @Test
//     @DisplayName("로그인 성공")
//     void login_success() throws Exception {
//         // 회원가입 선행
//         User user = new User();
//         user.setEmail("login@example.com");
//         user.setPassword(passwordEncoder.encode("pw1234"));
//         user.setName("loginuser");
//         user.setRole("USER");
//         userRepository.save(user);

//         LoginCommand command = new LoginCommand();
//         command.setEmail("login@example.com");
//         command.setPassword("pw1234");

//         mockMvc.perform(post("/api/auth/login")
//                 .contentType(MediaType.APPLICATION_JSON)
//                 .content(objectMapper.writeValueAsString(command)))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.accessToken").exists())
//                 .andExpect(jsonPath("$.refreshToken").exists())
//                 .andExpect(jsonPath("$.email").value("login@example.com"));
//     }

//     @Test
//     @DisplayName("로그인 실패 - 잘못된 비밀번호")
//     void login_fail_wrong_password() throws Exception {
//         User user = new User();
//         user.setEmail("fail@example.com");
//         user.setPassword(passwordEncoder.encode("pw1234"));
//         user.setName("failuser");
//         user.setRole("USER");
//         userRepository.save(user);

//         LoginCommand command = new LoginCommand();
//         command.setEmail("fail@example.com");
//         command.setPassword("wrongpw");

//         mockMvc.perform(post("/api/auth/login")
//                 .contentType(MediaType.APPLICATION_JSON)
//                 .content(objectMapper.writeValueAsString(command)))
//                 .andExpect(status().isUnauthorized())
//                 .andExpect(jsonPath("$.message").value("아이디 또는 비밀번호가 올바르지 않습니다."));
//     }
// }
