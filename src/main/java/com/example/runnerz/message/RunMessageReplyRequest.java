package com.example.runnerz.message;

import jakarta.validation.constraints.NotBlank;

public record RunMessageReplyRequest(@NotBlank String replyText) {
}
