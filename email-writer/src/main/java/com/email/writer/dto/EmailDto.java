package com.email.writer.dto;

import lombok.Data;


public class EmailDto {
    private String emailContent;
    private String tone;

    public EmailDto() {
    }

    public EmailDto(String emailContent, String tone) {
        this.emailContent = emailContent;
        this.tone = tone;
    }

    public String getEmailContent() {
        return emailContent;
    }

    public void setEmailContent(String emailContent) {
        this.emailContent = emailContent;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}
