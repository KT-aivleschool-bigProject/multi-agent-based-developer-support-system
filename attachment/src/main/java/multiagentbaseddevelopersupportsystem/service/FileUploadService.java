package multiagentbaseddevelopersupportsystem.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import multiagentbaseddevelopersupportsystem.domain.Attachment;
import multiagentbaseddevelopersupportsystem.domain.AttachmentRepository;

@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final AttachmentRepository attachmentRepository;

    @Value("${file.upload.path:/workspaces/multi-agent-based-developer-support-system/board/uploads/}")
    private String uploadPath;

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
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String storedFilename = UUID.randomUUID().toString() + extension;

        // 파일 저장
        Path filePath = uploadDir.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Attachment 엔티티 생성 및 저장
        Attachment attachment = Attachment.builder()
                .postId(postId)
                .originalName(originalFilename)
                .storedName(storedFilename)
                .fileUrl("/files/" + storedFilename)
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .createdAt(new Date())
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
}
