package multiagentbaseddevelopersupportsystem;

import multiagentbaseddevelopersupportsystem.config.kafka.KafkaProcessor;
import multiagentbaseddevelopersupportsystem.domain.SwaggerYamlPost;
import multiagentbaseddevelopersupportsystem.domain.SwaggerYamlPostRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableBinding(KafkaProcessor.class)
@EnableFeignClients
public class AttachmentApplication {

    public static ApplicationContext applicationContext;

    public static void main(String[] args) {
        applicationContext =
            SpringApplication.run(AttachmentApplication.class, args);
    }

    @Bean
    CommandLineRunner createSwaggerYamlPost(SwaggerYamlPostRepository swaggerYamlPostRepository) {
        return args -> {
            if (swaggerYamlPostRepository.count() == 0) {
                SwaggerYamlPost post = SwaggerYamlPost.builder()
                    .yamlContent("")
                    .build();
                swaggerYamlPostRepository.save(post);
            }
        };
    }
}
