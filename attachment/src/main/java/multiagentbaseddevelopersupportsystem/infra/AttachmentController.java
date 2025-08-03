package multiagentbaseddevelopersupportsystem.infra;

import java.io.IOException;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Attachment;
import multiagentbaseddevelopersupportsystem.service.AttachmentService;

@RestController
@RequestMapping("/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(value="/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Attachment> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("postId") Long postId) throws IOException {
        
        Attachment attachment = attachmentService.uploadFile(file, postId);
        return ResponseEntity.ok(attachment);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Attachment>> getFilesByPostId(@PathVariable Long postId) {
        List<Attachment> attachments = attachmentService.getFilesByPostId(postId);
        return ResponseEntity.ok(attachments);
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) throws IOException {
        attachmentService.deleteFile(fileId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) throws IOException {
        Resource resource = attachmentService.downloadFile(filename);
        String contentType = attachmentService.getContentType(filename);
        String originalFilename = attachmentService.getOriginalFilename(filename);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=\"" + originalFilename + "\"")
                .body(resource);
    }
}

