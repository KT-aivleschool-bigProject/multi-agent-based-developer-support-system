package multiagentbaseddevelopersupportsystem.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.models.BlobHttpHeaders;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import multiagentbaseddevelopersupportsystem.domain.Attachment;
import multiagentbaseddevelopersupportsystem.domain.AttachmentRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    
    @Autowired(required = false)
    private BlobContainerClient blobContainerClient;

    @Value("${file.storage.type:local}")
    private String storageType;

    @Value("${file.storage.local-path:./uploads/}")
    private String localPath;

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
        "jpg", "jpeg", "png", "gif", "bmp", "webp",
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
        "txt", "hwp"
    );

    public Attachment uploadFile(MultipartFile file, Long postId) throws IOException {
        validateFile(file);
        
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String storedFilename = generateStoredFilename(extension);
        
        String fileUrl;
        if ("azure".equals(storageType)) {
            fileUrl = uploadToAzure(file, storedFilename);
        } else {
            fileUrl = uploadToLocal(file, storedFilename);
        }

        // DB에 메타데이터 저장
        Attachment attachment = Attachment.builder()
                .postId(postId)
                .originalName(originalFilename)
                .storedName(storedFilename)
                .fileUrl(fileUrl)
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .build();

        log.info("파일 업로드 완료: {} -> {}", originalFilename, storedFilename);
        return attachmentRepository.save(attachment);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("유효하지 않은 파일명입니다.");
        }

        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않은 파일 확장자입니다: " + extension);
        }

        // 파일 크기 검증 (10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("파일 크기가 10MB를 초과합니다.");
        }
    }

    private String getFileExtension(String filename) {
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private String generateStoredFilename(String extension) {
        return UUID.randomUUID().toString() + "." + extension;
    }

    private String uploadToAzure(MultipartFile file, String storedFilename) throws IOException {
        if (blobContainerClient == null) {
            throw new RuntimeException("Azure Blob Storage가 설정되지 않았습니다.");
        }

        try {
            BlobClient blobClient = blobContainerClient.getBlobClient(storedFilename);
            
            // HTTP 헤더 설정
            BlobHttpHeaders headers = new BlobHttpHeaders()
                    .setContentType(file.getContentType())
                    .setContentDisposition("attachment; filename=\"" + file.getOriginalFilename() + "\"");

            // Azure에 파일 업로드
            blobClient.upload(new ByteArrayInputStream(file.getBytes()), file.getSize(), true);
            blobClient.setHttpHeaders(headers);

            log.info("Azure 업로드 완료: {}", storedFilename);
            return blobClient.getBlobUrl();
            
        } catch (Exception e) {
            log.error("Azure 업로드 실패: {}", e.getMessage(), e);
            throw new RuntimeException("파일 업로드에 실패했습니다: " + e.getMessage());
        }
    }

    private String uploadToLocal(MultipartFile file, String storedFilename) throws IOException {
        // 로컬 디렉토리 생성
        Path uploadDir = Paths.get(localPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 파일 저장
        Path filePath = uploadDir.resolve(storedFilename);
        Files.copy(file.getInputStream(), filePath);

        log.info("로컬 업로드 완료: {}", storedFilename);
        return "/files/" + storedFilename;
    }

    public List<Attachment> getFilesByPostId(Long postId) {
        return attachmentRepository.findByPostId(postId);
    }

    public void deleteFile(Long fileId) throws IOException {
        Attachment attachment = attachmentRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다."));

        if ("azure".equals(storageType)) {
            deleteFromAzure(attachment.getStoredName());
        } else {
            deleteFromLocal(attachment.getStoredName());
        }

        attachmentRepository.delete(attachment);
        log.info("파일 삭제 완료: {}", attachment.getStoredName());
    }

    private void deleteFromAzure(String storedFilename) {
        try {
            BlobClient blobClient = blobContainerClient.getBlobClient(storedFilename);
            blobClient.deleteIfExists();
        } catch (Exception e) {
            log.error("Azure 파일 삭제 실패: {}", e.getMessage(), e);
            throw new RuntimeException("파일 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    private void deleteFromLocal(String storedFilename) throws IOException {
        Path filePath = Paths.get(localPath, storedFilename);
        Files.deleteIfExists(filePath);
    }

    public Resource downloadFile(String filename) throws IOException {
        if ("azure".equals(storageType)) {
            return downloadFromAzure(filename);
        } else {
            return downloadFromLocal(filename);
        }
    }

    private Resource downloadFromAzure(String filename) throws IOException {
        try {
            BlobClient blobClient = blobContainerClient.getBlobClient(filename);
            
            if (!blobClient.exists()) {
                throw new RuntimeException("파일을 찾을 수 없습니다: " + filename);
            }

            byte[] content = blobClient.downloadContent().toBytes();
            return new ByteArrayResource(content);
            
        } catch (Exception e) {
            log.error("Azure 다운로드 실패: {}", e.getMessage(), e);
            throw new RuntimeException("파일 다운로드에 실패했습니다: " + e.getMessage());
        }
    }

    private Resource downloadFromLocal(String filename) throws IOException {
        Path filePath = Paths.get(localPath).resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("파일을 찾을 수 없습니다: " + filename);
        }

        return resource;
    }

    public String getContentType(String filename) throws IOException {
        if ("azure".equals(storageType)) {
            return getContentTypeFromAzure(filename);
        } else {
            return getContentTypeFromLocal(filename);
        }
    }

    private String getContentTypeFromAzure(String filename) {
        try {
            BlobClient blobClient = blobContainerClient.getBlobClient(filename);
            if (blobClient.exists()) {
                return blobClient.getProperties().getContentType();
            }
        } catch (Exception e) {
            log.warn("Azure에서 ContentType 조회 실패: {}", e.getMessage());
        }
        return "application/octet-stream";
    }

    private String getContentTypeFromLocal(String filename) throws IOException {
        Path filePath = Paths.get(localPath).resolve(filename);
        String contentType = Files.probeContentType(filePath);
        return contentType != null ? contentType : "application/octet-stream";
    }

    public String getOriginalFilename(String storedFilename) {
        return attachmentRepository.findAll().stream()
                .filter(attachment -> attachment.getStoredName().equals(storedFilename))
                .map(Attachment::getOriginalName)
                .findFirst()
                .orElse(storedFilename);
    }
}
