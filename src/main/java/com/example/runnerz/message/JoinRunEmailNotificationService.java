package com.example.runnerz.message;

import com.example.runnerz.kafka.RunJoinRequestedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class JoinRunEmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(JoinRunEmailNotificationService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String fromAddress;
    private final String frontendUrl;

    public JoinRunEmailNotificationService(
        ObjectProvider<JavaMailSender> mailSenderProvider,
        @Value("${app.mail.from:no-reply@jogteams.local}") String fromAddress,
        @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.mailSenderProvider = mailSenderProvider;
        this.fromAddress = fromAddress;
        this.frontendUrl = frontendUrl;
    }

    public void notifyOrganizerAboutJoinRequest(RunMessage message) {
        if (message == null || message.recipientEmail() == null || message.recipientEmail().isBlank()) {
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.info("Join request email skipped because JavaMailSender is not configured");
            return;
        }

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(message.recipientEmail());
        email.setFrom(fromAddress);
        email.setSubject("New join request in JogTeams");
        email.setText(buildBody(message));

        try {
            mailSender.send(email);
        } catch (MailException ex) {
            log.warn("Failed to send join request email to {}", message.recipientEmail(), ex);
        }
    }

    public void notifyOrganizerAboutJoinRequest(RunJoinRequestedEvent event) {
        if (event == null || event.organizerEmail() == null || event.organizerEmail().isBlank()) {
            return;
        }

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.info("Join request email skipped because JavaMailSender is not configured");
            return;
        }

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(event.organizerEmail());
        email.setFrom(fromAddress);
        email.setSubject("New join request in JogTeams");
        email.setText(buildBody(event));

        try {
            mailSender.send(email);
        } catch (MailException ex) {
            log.warn("Failed to send join request email to {}", event.organizerEmail(), ex);
        }
    }

    private String buildBody(RunMessage message) {
        String senderName = (message.senderName() == null || message.senderName().isBlank())
            ? "A runner"
            : message.senderName();
        String runTitle = (message.runTitle() == null || message.runTitle().isBlank())
            ? "your run"
            : message.runTitle();

        return String.format(
            "%s requested to join \"%s\".%n%nCheck your new messages in JogTeams: %s%n%nMessage:%n%s",
            senderName,
            runTitle,
            frontendUrl,
            message.messageText()
        );
    }

    private String buildBody(RunJoinRequestedEvent event) {
        String senderName = (event.requesterName() == null || event.requesterName().isBlank())
            ? "A runner"
            : event.requesterName();
        String runTitle = (event.runTitle() == null || event.runTitle().isBlank())
            ? "your run"
            : event.runTitle();

        return String.format(
            "%s requested to join \"%s\".%n%nCheck your new messages in JogTeams: %s%n%nMessage:%n%s",
            senderName,
            runTitle,
            frontendUrl,
            event.messageText()
        );
    }
}
