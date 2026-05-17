import React from "react";

export default function JoinRunMessageModal({
  run,
  recipientLabel,
  message,
  onChange,
  onClose,
  onSubmit,
  saving,
  error
}) {
  return (
    <div className="join-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="run-modal join-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="run-modal-header">
          <div>
            <p className="eyebrow">Join run</p>
            <h2 id="join-modal-title">Send join request</h2>
          </div>
          <button type="button" className="run-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="status">
          This will go to {recipientLabel || "the organizer"} for “{run.title}”.
        </p>

        {error ? <p className="status error">{error}</p> : null}

        <form className="run-form run-modal-form" onSubmit={onSubmit}>
          <label>
            To
            <input value={recipientLabel || ""} disabled />
          </label>

          <label>
            Message
            <textarea
              name="messageText"
              value={message}
              onChange={onChange}
              placeholder="Write why you want to join"
              rows={5}
              required
            />
          </label>

          <div className="run-form-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="primary-action" disabled={saving}>
              {saving ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
