package multiagentbaseddevelopersupportsystem.domain;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import multiagentbaseddevelopersupportsystem.config.MaskingSerializer;

@Data
@Builder
@AllArgsConstructor
public class UserDto {
    @JsonSerialize(using = MaskingSerializer.NameSerializer.class)
    private String name;
    @JsonSerialize(using = MaskingSerializer.EmailSerializer.class)
    private String email;
    private String position;
}
