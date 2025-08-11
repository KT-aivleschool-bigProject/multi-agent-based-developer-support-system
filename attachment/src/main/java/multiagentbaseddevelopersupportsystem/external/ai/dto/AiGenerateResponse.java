package multiagentbaseddevelopersupportsystem.external.ai.dto;

import lombok.*;

@Getter @Setter
public class AiGenerateResponse {
    private String title;
    private String content;
    private double confidence;
    private int filesProcessed;
}
