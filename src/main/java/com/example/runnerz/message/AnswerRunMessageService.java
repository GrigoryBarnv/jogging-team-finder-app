package com.example.runnerz.message;

import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AnswerRunMessageService {

    private final RunMessageRepository runMessageRepository;

    public AnswerRunMessageService(RunMessageRepository runMessageRepository) {
        this.runMessageRepository = runMessageRepository;
    }

    public RunMessage reply(OAuth2User user, Integer messageId, RunMessageReplyRequest request) {
        String email = requireEmail(user);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reply payload is required");
        }
        RunMessage message = runMessageRepository.findById(messageId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        if (!email.equals(message.recipientEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only reply to messages sent to you");
        }

        String replyText = normalizeReply(request.replyText());
        runMessageRepository.reply(messageId, replyText, LocalDateTime.now());
        return runMessageRepository.findById(messageId).orElseThrow(
            () -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Reply was saved but could not be reloaded")
        );
    }

    private String requireEmail(OAuth2User user) {
        if (user == null || user.getAttribute("email") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }

        return user.getAttribute("email").toString();
    }

    private String normalizeReply(String value) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reply is required");
        }

        if (normalized.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reply must be 1000 characters or fewer");
        }

        return normalized;
    }
}
