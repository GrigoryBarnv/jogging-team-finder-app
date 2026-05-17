import React from "react";

export default function NicknameModal({ nickname, onChange, onSubmit, saving, error }) {
  return (
    <div className="nickname-modal-backdrop" role="presentation">
      <section
        className="run-modal nickname-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nickname-modal-title"
      >
        <div className="run-modal-header">
          <div>
            <p className="eyebrow">Profile setup</p>
            <h2 id="nickname-modal-title">Choose your nickname</h2>
          </div>
        </div>

        <p className="status">
          This will be shown instead of your Google account name everywhere in the app.
        </p>

        {error ? <p className="status error">{error}</p> : null}

        <form className="run-form run-modal-form" onSubmit={onSubmit}>
          <label>
            Nickname
            <input
              name="nickname"
              value={nickname}
              onChange={onChange}
              placeholder="Runner42"
              maxLength={80}
              autoFocus
              required
            />
          </label>

          <div className="run-form-actions">
            <button type="submit" className="primary-action" disabled={saving}>
              {saving ? "Saving..." : "Save nickname"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
