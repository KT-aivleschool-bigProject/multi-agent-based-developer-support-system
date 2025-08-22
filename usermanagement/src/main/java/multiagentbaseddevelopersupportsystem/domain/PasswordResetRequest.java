package multiagentbaseddevelopersupportsystem.domain;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetRequest {

    @Size(max = 36, message = "토큰은 최대 36자까지 입력할 수 있습니다.")
    private String token;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Pattern(regexp = "^(?:" +
        // 3종류 조합: 영어, 숫자, 특수문자 모두 포함, 8~16자리
        "(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*\\-_=+\\[\\]{}|:,.?/~])(?!.*[()<>\"';'])[A-Za-z\\d!@#$%^&*\\-_=+\\[\\]{}|:,.?/~]{8,16}" +
        "|" +
        // 2종류 조합 1: 영어 + 숫자, 10~16자리
        "(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{10,16}" +
        "|" +
        // 2종류 조합 2: 영어 + 특수문자, 10~16자리, 제외 문자 포함 금지
        "(?=.*[A-Za-z])(?=.*[!@#$%^&*\\-_=+\\[\\]{}|:,.?/~])(?!.*[()<>\"';'])[A-Za-z!@#$%^&*\\-_=+\\[\\]{}|:,.?/~]{10,16}" +
        "|" +
        // 2종류 조합 3: 숫자 + 특수문자, 10~16자리, 제외 문자 포함 금지
        "(?=.*\\d)(?=.*[!@#$%^&*\\-_=+\\[\\]{}|:,.?/~])(?!.*[()<>\"';'])[\\d!@#$%^&*\\-_=+\\[\\]{}|:,.?/~]{10,16}" +
        ")$",
        message = "비밀번호는 영어, 숫자, 특수문자( ( ) < > \" ' ; 제외) 중 2종류 조합 시 10~16자리, 3종류 조합 시 8~16자리여야 합니다.")
    private String newPassword;
}
