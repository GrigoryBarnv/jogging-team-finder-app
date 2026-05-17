package com.example.runnerz.message;

import java.time.LocalDateTime;

public record RunMessage(
    Integer id,
    Integer runId,
    String runTitle,
    String senderEmail,
    String senderName,
    String recipientEmail,
    String recipientName,
    String messageText,
    String replyText,
    LocalDateTime createdAt,
    LocalDateTime repliedAt,
    LocalDateTime readAt
) {
}
