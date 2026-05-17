import React from "react";

export default function RunMessagesPanel({
  messages,
  currentUser,
  replyDrafts,
  onReplyDraftChange,
  onReply,
  replyingMessageId,
  replyError
}) {
  if (!messages.length) {
    return <p className="status">No messages yet. Send a join request to start a conversation.</p>;
  }

  return (
    <div className="message-list">
      {replyError ? <p className="status error">{replyError}</p> : null}
      {messages.map((message) => {
        const isIncoming = currentUser?.email === message.recipientEmail;
        const isOutgoing = currentUser?.email === message.senderEmail;
        const canReply = isIncoming && !message.replyText;
        const senderName = message.senderName || "Runner";
        const recipientName = message.recipientName || "Organizer";

        return (
          <article key={message.id} className="message-card">
            <div className="message-card-header">
              <div>
                <p className="eyebrow">{isIncoming ? "Join request" : "Sent message"}</p>
                <h3>{message.runTitle}</h3>
              </div>
              <span className="message-date">{formatDate(message.createdAt)}</span>
            </div>

            <p className="status message-status">
              {isIncoming
                ? `${senderName} wants to join this run.`
                : "You sent a join request for this run."}
            </p>

            <dl className="message-meta">
              <div>
                <dt>From</dt>
                <dd>{senderName}</dd>
              </div>
              <div>
                <dt>To</dt>
                <dd>{recipientName}</dd>
              </div>
            </dl>

            <div className="message-body">
              <p>{message.messageText}</p>
            </div>

            {message.replyText ? (
              <div className="message-reply">
                <p className="eyebrow">Reply</p>
                <p>{message.replyText}</p>
              </div>
            ) : null}

            {canReply ? (
              <form
                className="message-reply-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  onReply(message.id);
                }}
              >
                <label>
                  Reply
                  <textarea
                    value={replyDrafts[message.id] || ""}
                    onChange={(event) => onReplyDraftChange(message.id, event.target.value)}
                    rows={4}
                    placeholder="Reply to this join request"
                    required
                  />
                </label>
                <div className="run-form-actions">
                  <button type="submit" className="primary-action" disabled={replyingMessageId === message.id}>
                    {replyingMessageId === message.id ? "Sending..." : "Send reply"}
                  </button>
                </div>
              </form>
            ) : null}

            {isOutgoing && !message.replyText ? (
              <p className="status">Waiting for a reply from the organizer.</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
