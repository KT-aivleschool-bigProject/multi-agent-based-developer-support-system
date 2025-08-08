package multiagentbaseddevelopersupportsystem.external.ai;

import java.util.List;

public class AiGenerateRequest {
    private Long postId;
    private List<String> files;
    private String hint;

    public AiGenerateRequest() {}

    public AiGenerateRequest(Long postId, List<String> files, String hint) {
        this.postId = postId;
        this.files = files;
        this.hint = hint;
    }

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public List<String> getFiles() { return files; }
    public void setFiles(List<String> files) { this.files = files; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
}
