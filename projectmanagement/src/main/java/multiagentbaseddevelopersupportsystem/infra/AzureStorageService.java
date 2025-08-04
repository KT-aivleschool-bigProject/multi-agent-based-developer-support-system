package multiagentbaseddevelopersupportsystem.infra;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AzureStorageService {

    @Value("${azure.storage.connection-string}")
    private String connectionString;

    @Value("${azure.storage.container-name}")
    private String containerName;

    private BlobServiceClient blobServiceClient;
    private BlobContainerClient containerClient;

    public AzureStorageService() {
        // Constructor will be called after properties are injected
    }

    public void initializeClient() {
        if (blobServiceClient == null) {
            System.out.println("Initializing Azure Storage client...");
            System.out.println("Connection string length: " + (connectionString != null ? connectionString.length() : "null"));
            System.out.println("Container name: " + containerName);
            
            blobServiceClient = new BlobServiceClientBuilder()
                    .connectionString(connectionString)
                    .buildClient();
            containerClient = blobServiceClient.getBlobContainerClient(containerName);
            System.out.println("Azure Storage client initialized successfully");
        }
    }

    /**
     * 단일 파일을 Azure Blob Storage에 업로드
     */
    public String uploadFile(MultipartFile file) throws IOException {
        System.out.println("AzureStorageService.uploadFile called");
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());

        if (file.getSize() == 0) {
            throw new IllegalArgumentException("업로드할 파일의 크기가 0입니다.");
        }

        initializeClient();

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        BlobClient blobClient = containerClient.getBlobClient(fileName);

        byte[] fileData = file.getBytes();
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(fileData)) {
            blobClient.upload(inputStream, fileData.length, true);
        }

        return blobClient.getBlobUrl();
    }

    /**
     * 여러 파일을 Azure Blob Storage에 업로드
     */
    public List<String> uploadFiles(List<MultipartFile> files) throws IOException {
        List<String> uploadedUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            String url = uploadFile(file);
            uploadedUrls.add(url);
        }
        
        return uploadedUrls;
    }

    /**
     * Base64 인코딩된 파일 데이터를 업로드
     */
    public String uploadBase64File(String base64Data, String fileName) throws IOException {
        initializeClient();
        
        String uniqueFileName = generateUniqueFileName(fileName);
        BlobClient blobClient = containerClient.getBlobClient(uniqueFileName);
        
        // Base64 디코딩
        byte[] fileData = java.util.Base64.getDecoder().decode(base64Data);
        
        blobClient.upload(new java.io.ByteArrayInputStream(fileData), fileData.length, true);
        
        return blobClient.getBlobUrl();
    }

    /**
     * 파일 삭제
     */
    public void deleteFile(String blobName) {
        initializeClient();
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        try {
            blobClient.delete();
        } catch (com.azure.storage.blob.models.BlobStorageException e) {
            // Blob이 없을 경우 예외 무시
            if (e.getStatusCode() != 404) {
                throw e;
            }
        }
    }

    /**
     * 고유한 파일명 생성
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    /**
     * 파일 URL에서 blob 이름 추출
     */
    public String extractBlobNameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        
        // URL에서 blob 이름 부분 추출
        String[] parts = url.split("/");
        return parts[parts.length - 1];
    }
}