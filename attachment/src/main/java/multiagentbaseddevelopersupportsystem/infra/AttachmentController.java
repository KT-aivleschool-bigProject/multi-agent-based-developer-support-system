package multiagentbaseddevelopersupportsystem.infra;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Attachment;
import multiagentbaseddevelopersupportsystem.service.FileUploadService;


@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final FileUploadService fileUploadService;

    @Value("${file.upload.path:/workspaces/multi-agent-based-developer-support-system/board/uploads/}")
    private String uploadPath;

    @PostMapping("/upload")
    public ResponseEntity<Attachment> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("postId") Long postId) throws IOException {
        
        Attachment attachment = fileUploadService.uploadFile(file, postId);
        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Attachment>> getFilesByPostId(@PathVariable Long postId) {
        List<Attachment> attachments = fileUploadService.getFilesByPostId(postId);
        return ResponseEntity.ok(attachments);
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) throws IOException {
        fileUploadService.deleteFile(fileId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get(uploadPath).resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } else {
            throw new RuntimeException("파일을 찾을 수 없습니다: " + filename);
        }
    }
}

