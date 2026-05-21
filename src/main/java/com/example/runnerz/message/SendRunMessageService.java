package com.example.runnerz.message;

import java.time.LocalDateTime;
import com.example.runnerz.kafka.RunMessageKafkaProducer;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.example.runnerz.run.JdbcClientRunRepository;
import com.example.runnerz.run.Run;
import com.example.runnerz.security.UserProfileService;

@Service
public class SendRunMessageService {

    private final RunMessageRepository runMessageRepository;
    private final JdbcClientRunRepository runRepository;
    private final UserProfileService userProfileService;
    private final RunMessageKafkaProducer runMessageKafkaProducer;

    public SendRunMessageService(
        RunMessageRepository runMessageRepository,
        JdbcClientRunRepository runRepository,
        UserProfileService userProfileService,
        RunMessageKafkaProducer runMessageKafkaProducer
    ) {
        this.runMessageRepository = runMessageRepository;
        this.runRepository = runRepository;
        this.userProfileService = userProfileService;
        this.runMessageKafkaProducer = runMessageKafkaProducer;
    }

    public RunMessage send(OAuth2User user, JoinRunMessageRequest request) {
        String senderEmail = requireEmail(user);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message payload is required");
        }
        Run run = runRepository.findById(request.runId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Run not found"));

        if (run.userEmail() == null || run.userEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Run does not have an organizer");
        }

        if (senderEmail.equals(run.userEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot join your own run");
        }

        String messageText = normalizeMessage(request.messageText());
        String senderName = safeName(userProfileService.getDisplayName(user), "Runner");
        String recipientName = safeName(userProfileService.getDisplayNameByEmail(run.userEmail()), "Organizer");

        RunMessage message = new RunMessage(
            null,
            run.id(),
            run.title(),
            senderEmail,
            senderName,
            run.userEmail(),
            recipientName,
            messageText,
            null,
            LocalDateTime.now(),
            null,
            null
        );

        RunMessage savedMessage = runMessageRepository.save(message);
        // Message persistence stays synchronous; notification is now async via Kafka.
        runMessageKafkaProducer.publishJoinRequested(savedMessage);
        return savedMessage;
    }

    private String requireEmail(OAuth2User user) {
        if (user == null || user.getAttribute("email") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }

        return user.getAttribute("email").toString();
    }

    private String normalizeMessage(String value) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }

        if (normalized.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message must be 1000 characters or fewer");
        }

        return normalized;
    }

    private String safeName(String value, String fallback) {
        String normalized = value == null ? "" : value.trim();
        return normalized.isBlank() ? fallback : normalized;
    }
}
