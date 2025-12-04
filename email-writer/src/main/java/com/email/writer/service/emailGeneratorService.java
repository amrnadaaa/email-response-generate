package com.email.writer.service;
import com.email.writer.dto.EmailDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class emailGeneratorService {

    private final WebClient webClient;
    private final String geminiApiKey;

    // 👇 يمكنك إضافة property لـ model name
    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String geminiModel;

    public emailGeneratorService(WebClient webClient,
                                 @Value("${gemini.api.key}") String geminiApiKey) {
        this.webClient = webClient;
        this.geminiApiKey = geminiApiKey;
    }

    public String generateEmailReplay(EmailDto emailRequest) {
        // 1. Build Prompt
        String prompt = promptBuilder(emailRequest);

        // 2. Build Request Body
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                },
                // 👇 يمكنك إضافة إعدادات توليد
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 500
                )
        );

        try {
            System.out.println("Using model: " + geminiModel);
            System.out.println("API Key (first 10 chars): " + geminiApiKey.substring(0, 10) + "...");

            // 3. استخدم الـ model الصحيح - غير gemini-1.5-flash
            String response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("generativelanguage.googleapis.com")
                            .path("/v1beta/models/" + geminiModel + ":generateContent")
                            .queryParam("key", this.geminiApiKey)
                            .build())
                    .header("Content-Type", "application/json")
                    .header("X-goog-api-key", this.geminiApiKey) // 👈 أضف هذا الـ header
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> {
                                System.err.println("HTTP Error: " + clientResponse.statusCode());
                                return clientResponse.bodyToMono(String.class)
                                        .flatMap(errorBody -> {
                                            System.err.println("Error Body: " + errorBody);
                                            return Mono.error(new RuntimeException("API Error: " + errorBody));
                                        });
                            })
                    .bodyToMono(String.class)
                    .block();

            System.out.println("API Response received successfully");
            return extractResponseContent(response);

        } catch (Exception e) {
            System.err.println("API ERROR: " + e.getMessage());
            e.printStackTrace();
            return "Error generating email: " + e.getMessage() +
                    "\nModel used: " + geminiModel;
        }
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(response);

            if (!node.has("candidates") || node.get("candidates").isEmpty()) {
                System.err.println("No candidates in response: " + response);
                return "No response generated";
            }

            return node.path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            System.err.println("Parse Error: " + e.getMessage());
            System.err.println("Response was: " + response);
            return "Error parsing response: " + e.getMessage();
        }
    }

    private String promptBuilder(EmailDto emailRequest) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a professional email assistant. Write a concise email reply to the following message.\n\n");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            sb.append("Tone: ").append(emailRequest.getTone()).append("\n\n");
        }

        sb.append("Original Email:\n").append(emailRequest.getEmailContent()).append("\n\n");
        sb.append("Instructions:\n");
        sb.append("1. Write only the email reply text\n");
        sb.append("2. Use standard email format (greeting, body, closing)\n");
        sb.append("3. Keep it brief (3-5 sentences)\n");
        sb.append("4. Make it natural and professional\n");
        sb.append("5. Do not include subject line\n\n");
        sb.append("Email Reply:");

        return sb.toString();
    }
}