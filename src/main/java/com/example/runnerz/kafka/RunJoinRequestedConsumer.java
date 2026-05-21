package com.example.runnerz.kafka;

import com.example.runnerz.message.JoinRunEmailNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class RunJoinRequestedConsumer {

    private static final Logger log = LoggerFactory.getLogger(RunJoinRequestedConsumer.class);

    private final JoinRunEmailNotificationService joinRunEmailNotificationService;

    public RunJoinRequestedConsumer(JoinRunEmailNotificationService joinRunEmailNotificationService) {
        this.joinRunEmailNotificationService = joinRunEmailNotificationService;
    }

    // Consumes USER_JOINED_RUN events and triggers organizer notification.
    @KafkaListener(
        topics = "${app.kafka.topic.run-events:run-events}",
        groupId = "${app.kafka.group.notifications:runnerz-notification-group}"
    )
    public void onRunJoinRequested(RunJoinRequestedEvent event) {
        log.info("Consumed USER_JOINED_RUN event for run {}", event.runId());
        joinRunEmailNotificationService.notifyOrganizerAboutJoinRequest(event);
    }
}
