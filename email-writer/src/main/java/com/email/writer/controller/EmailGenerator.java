package com.email.writer.controller;

import com.email.writer.dto.EmailDto;
import com.email.writer.service.emailGeneratorService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
public class EmailGenerator {
    emailGeneratorService emailGeneratorService;
    public EmailGenerator(emailGeneratorService emailGeneratorService) {
        this.emailGeneratorService = emailGeneratorService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailDto emailDto) throws JsonProcessingException {
        String response=emailGeneratorService.generateEmailReplay(emailDto);
        return ResponseEntity.ok(response);

    }

}
