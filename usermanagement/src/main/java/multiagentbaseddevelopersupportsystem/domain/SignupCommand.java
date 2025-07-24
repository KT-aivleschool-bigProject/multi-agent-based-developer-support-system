package multiagentbaseddevelopersupportsystem.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;

@Data
public class SignupCommand {

    private String email;
    private String password;
    private String name;
    private String position;
}
