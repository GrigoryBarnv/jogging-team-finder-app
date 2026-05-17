package com.example.runnerz.message;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.util.Assert;

@Repository
public class RunMessageRepository {

    private final JdbcClient jdbcClient;

    public RunMessageRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<RunMessage> findForUser(String email) {
        return jdbcClient.sql("""
                SELECT id,
                       run_id,
                       run_title,
                       sender_email,
                       sender_name,
                       recipient_email,
                       recipient_name,
                       message_text,
                       reply_text,
                       created_at,
                       replied_at,
                       read_at
                FROM run_messages
                WHERE sender_email = :email
                   OR recipient_email = :email
                ORDER BY created_at DESC, id DESC
                """)
            .param("email", email)
            .query((rs, rowNum) -> mapMessage(rs, rowNum))
            .list();
    }

    public Optional<RunMessage> findById(Integer id) {
        return jdbcClient.sql("""
                SELECT id,
                       run_id,
                       run_title,
                       sender_email,
                       sender_name,
                       recipient_email,
                       recipient_name,
                       message_text,
                       reply_text,
                       created_at,
                       replied_at,
                       read_at
                FROM run_messages
                WHERE id = :id
                """)
            .param("id", id)
            .query((rs, rowNum) -> mapMessage(rs, rowNum))
            .optional();
    }

    public RunMessage save(RunMessage message) {
        Integer id = message.id() == null ? nextId() : message.id();
        int updated = jdbcClient.sql("""
                INSERT INTO run_messages (
                    id,
                    run_id,
                    run_title,
                    sender_email,
                    sender_name,
                    recipient_email,
                    recipient_name,
                    message_text,
                    reply_text,
                    created_at,
                    replied_at,
                    read_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """)
            .params(Arrays.asList(
                id,
                message.runId(),
                message.runTitle(),
                message.senderEmail(),
                message.senderName(),
                message.recipientEmail(),
                message.recipientName(),
                message.messageText(),
                message.replyText(),
                message.createdAt(),
                message.repliedAt(),
                message.readAt()))
            .update();

        Assert.state(updated == 1, "Failed to save run message " + id);
        return new RunMessage(
            id,
            message.runId(),
            message.runTitle(),
            message.senderEmail(),
            message.senderName(),
            message.recipientEmail(),
            message.recipientName(),
            message.messageText(),
            message.replyText(),
            message.createdAt(),
            message.repliedAt(),
            message.readAt()
        );
    }

    public void reply(Integer id, String replyText, LocalDateTime repliedAt) {
        int updated = jdbcClient.sql("""
                UPDATE run_messages
                SET reply_text = :replyText,
                    replied_at = :repliedAt
                WHERE id = :id
                """)
            .param("id", id)
            .param("replyText", replyText)
            .param("repliedAt", repliedAt)
            .update();

        Assert.state(updated == 1, "Failed to reply to run message " + id);
    }

    public void markIncomingAsRead(String recipientEmail, LocalDateTime readAt) {
        jdbcClient.sql("""
                UPDATE run_messages
                SET read_at = :readAt
                WHERE recipient_email = :recipientEmail
                  AND read_at IS NULL
                """)
            .param("recipientEmail", recipientEmail)
            .param("readAt", readAt)
            .update();
    }

    public int countUnreadForUser(String recipientEmail) {
        Long count = jdbcClient.sql("""
                SELECT COUNT(*)
                FROM run_messages
                WHERE recipient_email = :recipientEmail
                  AND read_at IS NULL
                """)
            .param("recipientEmail", recipientEmail)
            .query(Long.class)
            .single();
        return count == null ? 0 : count.intValue();
    }

    private RunMessage mapMessage(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new RunMessage(
            rs.getInt("id"),
            rs.getInt("run_id"),
            rs.getString("run_title"),
            rs.getString("sender_email"),
            rs.getString("sender_name"),
            rs.getString("recipient_email"),
            rs.getString("recipient_name"),
            rs.getString("message_text"),
            rs.getString("reply_text"),
            rs.getTimestamp("created_at").toLocalDateTime(),
            rs.getTimestamp("replied_at") == null ? null : rs.getTimestamp("replied_at").toLocalDateTime(),
            rs.getTimestamp("read_at") == null ? null : rs.getTimestamp("read_at").toLocalDateTime()
        );
    }

    private Integer nextId() {
        Integer id = jdbcClient.sql("SELECT COALESCE(MAX(id), 0) + 1 FROM run_messages")
            .query(Integer.class)
            .single();
        return id == null ? 1 : id;
    }
}
