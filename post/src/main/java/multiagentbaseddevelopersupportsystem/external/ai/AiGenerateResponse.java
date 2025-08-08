package multiagentbaseddevelopersupportsystem.external.ai;

public class AiGenerateResponse {
    private String title;
    private String content;
    private Double confidence;

    public AiGenerateResponse() {}

    public AiGenerateResponse(String title, String content, Double confidence) {
        this.title = title;
        this.content = content;
        this.confidence = confidence;
    }

    public String getTitle() { return title; }
    public String getContent() { return content; }
    public Double getConfidence() { return confidence; }

    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
}
