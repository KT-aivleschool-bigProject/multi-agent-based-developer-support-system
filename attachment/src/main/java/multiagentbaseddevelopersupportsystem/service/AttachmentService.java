package multiagentbaseddevelopersupportsystem.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Attachment;
import multiagentbaseddevelopersupportsystem.domain.AttachmentRepository;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;

    @Value("${file.upload.path}")
    private String uploadPath;

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
        "jpg", "jpeg", "png", "gif", "bmp", "webp",
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
        "txt", "hwp"
    );

    public Attachment uploadFile(MultipartFile file, Long postId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        // 업로드 디렉토리 생성
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 파일명 생성 (UUID + 원본 확장자)
        String originalFilename = file.getOriginalFilename();
        if (!originalFilename.contains(".")) {
            throw new IllegalArgumentException("유효하지 않은 파일명입니다.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않은 파일 확장자입니다. (" + extension + ")");
        }

        String storedFilename = UUID.randomUUID().toString() + "." + extension;

        // 파일 저장
        Path filePath = uploadDir.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath);

        // Attachment 엔티티 생성 및 저장
        Attachment attachment = Attachment.builder()
                .postId(postId)
                .originalName(originalFilename)
                .storedName(storedFilename)
                .fileUrl("/files/" + storedFilename)
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .build();

        return attachmentRepository.save(attachment);
    }

    public List<Attachment> getFilesByPostId(Long postId) {
        return attachmentRepository.findByPostId(postId);
    }

    public void deleteFile(Long fileId) throws IOException {
        Attachment attachment = attachmentRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다."));

        // 실제 파일 삭제
        Path filePath = Paths.get(uploadPath, attachment.getStoredName());
        Files.deleteIfExists(filePath);

        // DB에서 삭제
        attachmentRepository.delete(attachment);
    }

    public Resource downloadFile(String filename) throws IOException {
        Path filePath = Paths.get(uploadPath).resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("파일을 찾을 수 없습니다: " + filename);
        }

        return resource;
    }

    public String getContentType(String filename) throws IOException {
        Path filePath = Paths.get(uploadPath).resolve(filename);
        String contentType = Files.probeContentType(filePath);
        
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        return contentType;
    }

    public String getOriginalFilename(String storedFilename) {
        // 저장된 파일명으로 원본 파일명을 찾는 로직
        List<Attachment> attachments = attachmentRepository.findAll();
        return attachments.stream()
                .filter(attachment -> attachment.getStoredName().equals(storedFilename))
                .map(Attachment::getOriginalName)
                .findFirst()
                .orElse(storedFilename);
    }
}
