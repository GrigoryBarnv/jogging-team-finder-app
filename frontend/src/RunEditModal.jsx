import React from "react";

export default function RunEditModal({
  districtOptions,
  editingRunId,
  onClose,
  onSubmit,
  runForm,
  savingRun,
  updateRunForm
}) {
  if (editingRunId == null) {
    return null;
  }

  return (
    <div className="run-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="run-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="run-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="run-modal-header">
          <div>
            <p className="eyebrow">Edit run</p>
            <h2 id="run-edit-title">Update parameters</h2>
          </div>
          <button type="button" className="run-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="status edit-status">Editing run #{editingRunId}</p>

        <form className="run-form run-modal-form" onSubmit={onSubmit}>
          <label>
            Title
            <input
              name="title"
              value={runForm.title}
              onChange={updateRunForm}
              placeholder="Evening run"
              required
            />
          </label>

          <label>
            Kilometers
            <input
              name="miles"
              type="text"
              inputMode="decimal"
              pattern="[0-9]+([.,][0-9]+)?"
              value={runForm.miles}
              onChange={updateRunForm}
              placeholder="5.4 or 5,4"
              required
            />
          </label>

          <label>
            Location
            <select name="location" value={runForm.location} onChange={updateRunForm}>
              <option value="OUTDOOR">Outdoor</option>
              <option value="INDOOR">Indoor</option>
            </select>
          </label>

          <label>
            Dresden district
            <select name="district" value={runForm.district} onChange={updateRunForm}>
              {districtOptions.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>

          <label>
            Start time
            <input
              name="startedOn"
              type="datetime-local"
              value={runForm.startedOn}
              onChange={updateRunForm}
              required
            />
          </label>

          <label>
            Duration (minutes)
            <input
              name="durationMinutes"
              type="number"
              min="1"
              step="1"
              value={runForm.durationMinutes}
              onChange={updateRunForm}
              required
            />
          </label>

          <div className="run-form-actions">
            <button type="button" className="secondary-action" onClick={onClose} disabled={savingRun}>
              Cancel
            </button>
            <button type="submit" className="primary-action" disabled={savingRun}>
              {savingRun ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
