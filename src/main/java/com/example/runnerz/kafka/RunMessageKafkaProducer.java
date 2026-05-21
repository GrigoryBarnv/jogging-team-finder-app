package com.example.runnerz.kafka;

import com.example.runnerz.message.RunMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class RunMessageKafkaProducer {

    private static final Logger log = LoggerFactory.getLogger(RunMessageKafkaProducer.class);

    private final KafkaTemplate<Object, Object> kafkaTemplate;
    private final String runEventsTopic;

    public RunMessageKafkaProducer(
        KafkaTemplate<Object, Object> kafkaTemplate,
        @Value("${app.kafka.topic.run-events:run-events}") String runEventsTopic
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.runEventsTopic = runEventsTopic;
    }

    // Publishes an async domain event after the join request is saved.
    public void publishJoinRequested(RunMessage message) {
        RunJoinRequestedEvent event = new RunJoinRequestedEvent(
            message.id(),
            message.runId(),
            message.runTitle(),
            message.recipientEmail(),
            message.recipientName(),
            message.senderEmail(),
            message.senderName(),
            message.messageText(),
            message.createdAt()
        );

        kafkaTemplate.send(runEventsTopic, String.valueOf(message.runId()), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.warn("Failed to publish USER_JOINED_RUN event for message {}", message.id(), ex);
                } else {
                    log.info("Published USER_JOINED_RUN event for message {} to topic {}", message.id(), runEventsTopic);
                }
            });
    }
}
