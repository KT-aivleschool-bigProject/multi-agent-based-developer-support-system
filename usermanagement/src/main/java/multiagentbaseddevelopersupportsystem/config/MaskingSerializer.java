package multiagentbaseddevelopersupportsystem.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import multiagentbaseddevelopersupportsystem.util.MaskingUtil;

import java.io.IOException;

public class MaskingSerializer {

    // 이메일용
    public static class EmailSerializer extends JsonSerializer<String> {
        @Override
        public void serialize(String value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            gen.writeString(MaskingUtil.maskEmail(value));
        }
    }

    // 이름용
    public static class NameSerializer extends JsonSerializer<String> {
        @Override
        public void serialize(String value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            gen.writeString(MaskingUtil.maskName(value));
        }
    }
}

