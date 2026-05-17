package com.example.runnerz.message;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JoinRunMessageRequest(
    @NotNull Integer runId,
    @NotBlank String messageText
) {
}
