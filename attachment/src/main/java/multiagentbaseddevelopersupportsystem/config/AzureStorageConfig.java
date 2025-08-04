package multiagentbaseddevelopersupportsystem.config;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "file.storage.type", havingValue = "azure")
@Slf4j
public class AzureStorageConfig {

    @Value("${azure.storage.account-name}")
    private String accountName;

    @Value("${azure.storage.account-key}")
    private String accountKey;

    @Value("${azure.storage.container-name}")
    private String containerName;

    @Bean
    public BlobServiceClient blobServiceClient() {
        String connectionString = String.format(
            "DefaultEndpointsProtocol=https;AccountName=%s;AccountKey=%s;EndpointSuffix=core.windows.net",
            accountName, accountKey
        );
        
        log.info("Azure Blob Storage 연결 초기화: {}", accountName);
        
        return new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
    }

    @Bean
    public BlobContainerClient blobContainerClient(BlobServiceClient blobServiceClient) {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        
        // 컨테이너가 존재하지 않으면 생성
        if (!containerClient.exists()) {
            containerClient.create();
            log.info("Azure Blob Container 생성됨: {}", containerName);
        }
        
        return containerClient;
    }
}
