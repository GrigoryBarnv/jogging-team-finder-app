package com.example.runnerz.kafka;

import java.time.LocalDateTime;

// Event payload published when a runner requests to join a run.
public record RunJoinRequestedEvent(
    Integer messageId,
    Integer runId,
    String runTitle,
    String organizerEmail,
    String organizerName,
    String requesterEmail,
    String requesterName,
    String messageText,
    LocalDateTime createdAt
) {
}
