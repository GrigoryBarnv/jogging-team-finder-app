package com.example.runnerz.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {

    // Creates the topic automatically in local/dev when broker settings allow it.
    @Bean
    NewTopic runEventsTopic(@Value("${app.kafka.topic.run-events:run-events}") String topicName) {
        return TopicBuilder.name(topicName)
            .partitions(1)
            .replicas(1)
            .build();
    }
}
