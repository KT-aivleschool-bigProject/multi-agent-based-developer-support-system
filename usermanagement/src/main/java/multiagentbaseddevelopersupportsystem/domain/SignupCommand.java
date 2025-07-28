package multiagentbaseddevelopersupportsystem.domain;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupCommand {

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, max = 100, message = "비밀번호는 8자 이상 100자 이하여야 합니다.")
    private String password;

    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 최대 50자까지 입력할 수 있습니다.")
    private String name;

    @NotBlank(message = "직책은 필수입니다.")
    @Size(max = 50, message = "직책은 최대 50자까지 입력할 수 있습니다.")
    private String position;
}
