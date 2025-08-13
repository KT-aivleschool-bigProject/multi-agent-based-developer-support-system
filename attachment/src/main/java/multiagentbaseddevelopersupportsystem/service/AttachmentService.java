package multiagentbaseddevelopersupportsystem.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import multiagentbaseddevelopersupportsystem.domain.Attachment;
import multiagentbaseddevelopersupportsystem.domain.AttachmentRepository;
import multiagentbaseddevelopersupportsystem.domain.PostCreatedByAttachmentAgent;
import multiagentbaseddevelopersupportsystem.domain.ProjectAttachmentAutoCreated;
import multiagentbaseddevelopersupportsystem.domain.ProjectAttachmentRequest;
import multiagentbaseddevelopersupportsystem.domain.ProjectCreated;


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

    public Attachment uploadFile(MultipartFile file, Long postId, Long projectId) throws IOException {
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
                .projectId(projectId)
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
            if (blobClient.exists()) {
                blobClient.delete();
            }
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

            try (java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream()) {
                blobClient.download(outputStream);
                byte[] content = outputStream.toByteArray();
                return new ByteArrayResource(content);
            }
            
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

    public void sendProjectAttachmentsToDocumentAgent(ProjectCreated projectCreated) {
        Long projectId = projectCreated.getProjectId();
        List<Attachment> files = attachmentRepository.findByProjectId(projectId);
        if (files.isEmpty()) {
            log.warn("프로젝트에 첨부파일이 없습니다: {}", projectId);
            return;
        }

        List<ProjectAttachmentRequest> result = new ArrayList<>();
        if ("azure".equals(storageType) && blobContainerClient != null) {
            for (Attachment file : files) {
                ProjectAttachmentRequest fileInfo = new ProjectAttachmentRequest();
                fileInfo.setFileId(file.getFileId());

                // SAS URL 생성
                BlobClient blobClient = blobContainerClient.getBlobClient(file.getStoredName());
                BlobSasPermission permission = new BlobSasPermission().setReadPermission(true);
                OffsetDateTime expiryTime = OffsetDateTime.now().plusHours(1); // 1시간 유효
                BlobServiceSasSignatureValues values = new BlobServiceSasSignatureValues(expiryTime, permission);

                String sasUrl = blobClient.getBlobUrl() + "?" + blobClient.generateSas(values);
                fileInfo.setSasUrl(sasUrl);

                result.add(fileInfo);
            }
        } 

        // === FastAPI 서버로 REST POST 요청 ===
        String fastApiUrl = "http://fastapi-server:8000/receive-attachments"; // 실제 엔드포인트로 변경
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<ProjectAttachmentRequest>> requestEntity = new HttpEntity<>(result, headers);

        try {
            ResponseEntity<List<ProjectAttachmentAutoCreated>> response = restTemplate.exchange(
                fastApiUrl,
                org.springframework.http.HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<List<ProjectAttachmentAutoCreated>>() {}
            );
            List<ProjectAttachmentAutoCreated> body = response.getBody();
            if (body != null) {
                log.info("FastAPI 응답: {}", body);
                body.forEach(ProjectAttachmentAutoCreated::publishAfterCommit);
            } else {
                log.warn("FastAPI 응답이 비어있습니다.");
            }
        } catch (Exception e) {
            log.error("FastAPI 서버 호출 실패: {}", e.getMessage(), e);
        }

        return;
    }

    public void updatePostIdInFile(PostCreatedByAttachmentAgent postCreatedByAttachmentAgent) {
        Long postId = postCreatedByAttachmentAgent.getPostId();
        Long fileId = postCreatedByAttachmentAgent.getFileId();

        Attachment attachment = attachmentRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("No Entity Found"));
        attachment.setPostId(postId);
        attachmentRepository.save(attachment);
    }
}
