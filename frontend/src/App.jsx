import React from "react";
import { useEffect, useState } from "react";
import NicknameModal from "./NicknameModal";
import JoinRunMessageModal from "./JoinRunMessageModal";
import RunMessagesPanel from "./RunMessagesPanel";
import RunEditModal from "./RunEditModal";

const KM_PER_MILE = 1.609344;
const DRESDEN_DISTRICTS = [
  "Altstadt",
  "Neustadt",
  "Pieschen",
  "Klotzsche",
  "Loschwitz",
  "Blasewitz",
  "Leuben",
  "Prohlis",
  "Plauen",
  "Cotta"
];
const EMPTY_RUN_FORM = {
  title: "",
  miles: "",
  location: "OUTDOOR",
  district: "Altstadt",
  startedOn: "",
  durationMinutes: ""
};

function buildRunFormFromRun(run) {
  return {
    title: run.title ?? "",
    miles: run.miles == null ? "" : String(Number((run.miles * KM_PER_MILE).toFixed(1))),
    location: run.location ?? "OUTDOOR",
    district: run.district || "Altstadt",
    startedOn: toDatetimeLocalValue(run.startedOn),
    durationMinutes: String(getDurationMinutes(run.startedOn, run.completedOn))
  };
}

function App() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [myRuns, setMyRuns] = useState([]);
  const [hasFetchedMine, setHasFetchedMine] = useState(false);
  const [runForm, setRunForm] = useState(EMPTY_RUN_FORM);
  const [savingRun, setSavingRun] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [editingRunId, setEditingRunId] = useState(null);
  const [myRunsCreateOpen, setMyRunsCreateOpen] = useState(false);
  const [view, setView] = useState("feed");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [activeMainPanel, setActiveMainPanel] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasFetchedMessages, setHasFetchedMessages] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [joinRunTarget, setJoinRunTarget] = useState(null);
  const [joinRecipientLabel, setJoinRecipientLabel] = useState("");
  const [joinMessageDraft, setJoinMessageDraft] = useState("");
  const [sendingJoinMessage, setSendingJoinMessage] = useState(false);
  const [joinMessageError, setJoinMessageError] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyingMessageId, setReplyingMessageId] = useState(null);
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          return;
        }

        const user = await response.json();
        if (user.authenticated) {
          setCurrentUser(user);
          setNicknameDraft(user.nickname || user.name || "");
          await fetchMyRuns();
          await fetchMessages();
          await fetchUnreadMessageCount();
        }
        await fetchRuns();
      } catch {
        setCurrentUser(null);
      }
    }

    loadCurrentUser();
  }, []);

  async function fetchRuns({ district = "ALL", query = "" } = {}) {
    const trimmedQuery = query.trim();
    const hasSearchCriteria = trimmedQuery !== "" || (district && district !== "ALL");

    try {
      setLoading(true);
      setError("");
      setSearchMessage("");
      const params = new URLSearchParams();

      if (district && district !== "ALL") {
        params.set("district", district);
      }

      if (trimmedQuery !== "") {
        params.set("q", trimmedQuery);
      }

      const search = params.toString();
      const response = await fetch(`/api/runs/future${search ? `?${search}` : ""}`);

      if (!response.ok) {
        if (hasSearchCriteria) {
          setRuns([]);
          setHasFetched(true);
          setSearchMessage(
            "No runs found for the specified parameters, please choose different options."
          );
          return;
        }

        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setRuns(data);
      setHasFetched(true);

      if (hasSearchCriteria && data.length === 0) {
        setSearchMessage("No runs found for the specified parameters, please choose different options.");
      }
    } catch (err) {
      if (hasSearchCriteria) {
        setRuns([]);
        setHasFetched(true);
        setSearchMessage("No runs found for the specified parameters, please choose different options.");
        return;
      }

      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyRuns() {
    const response = await fetch("/api/runs/me");

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setMyRuns(data);
    setHasFetchedMine(true);
  }

  async function fetchMessages() {
    const response = await fetch("/api/messages");

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setMessages(data);
    setHasFetchedMessages(true);
  }

  async function fetchUnreadMessageCount() {
    const response = await fetch("/api/messages/unread-count");

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const count = Number(data);
    setUnreadMessageCount(Number.isFinite(count) ? count : 0);
  }

  function updateNickname(event) {
    setNicknameDraft(event.target.value);
  }

  async function submitNickname(event) {
    event.preventDefault();

    try {
      setSavingNickname(true);
      setNicknameError("");

      const response = await fetch("/api/auth/nickname", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nickname: nicknameDraft })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const updatedUser = await response.json();
      setCurrentUser(updatedUser);
      setNicknameDraft(updatedUser.nickname || updatedUser.displayName || "");
      await fetchMyRuns();
      await fetchMessages();
      await fetchUnreadMessageCount();
    } catch (err) {
      setNicknameError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSavingNickname(false);
    }
  }

  function startGoogleLogin() {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  }

  function logout() {
    window.location.href = "http://localhost:8080/logout";
  }

  function openProfilePanel(panel) {
    if (panel === "runs") {
      setView("my-runs");
      setProfilePanel("");
    } else {
      setView("profile");
      setProfilePanel(panel);
      if (panel === "messages" && !hasFetchedMessages) {
        fetchMessages();
      }
    }
    setProfileMenuOpen(false);
  }

  async function openMessagesPanel() {
    setView("profile");
    setProfilePanel("messages");
    setProfileMenuOpen(false);
    await fetchMessages();
    await fetch("/api/messages/mark-read", { method: "POST" }).catch(() => {});
    await fetchUnreadMessageCount();
  }

  function getDisplayName(user) {
    if (!user) {
      return "";
    }

    return user.displayName || user.nickname || user.name || user.email || "";
  }

  async function openJoinRunMessage(run) {
    setJoinRunTarget(run);
    setJoinRecipientLabel("Organizer");
    setJoinMessageDraft(`Hi, IвЂ™d like to join your run "${run.title}".`);
    setJoinMessageError("");

    if (!run.userEmail) {
      return;
    }

    try {
      const response = await fetch(`/api/auth/display-name?email=${encodeURIComponent(run.userEmail)}`);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const displayName = typeof data.displayName === "string" ? data.displayName.trim() : "";
      if (displayName) {
        setJoinRecipientLabel(displayName);
      }
    } catch {
      setJoinRecipientLabel("Organizer");
    }
  }

  function closeJoinRunMessage() {
    setJoinRunTarget(null);
    setJoinRecipientLabel("");
    setJoinMessageDraft("");
    setJoinMessageError("");
  }

  async function submitJoinRunMessage(event) {
    event.preventDefault();

    if (!joinRunTarget) {
      return;
    }

    try {
      setSendingJoinMessage(true);
      setJoinMessageError("");

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          runId: joinRunTarget.id,
          messageText: joinMessageDraft
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      closeJoinRunMessage();
      setSaveMessage("Join request sent.");
      await fetchMessages();
      await fetchUnreadMessageCount();
      if (view === "profile" && profilePanel === "messages") {
        await fetchMessages();
      }
    } catch (err) {
      setJoinMessageError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSendingJoinMessage(false);
    }
  }

  function updateReplyDraft(messageId, value) {
    setReplyDrafts((current) => ({ ...current, [messageId]: value }));
  }

  async function submitReply(messageId) {
    const replyText = replyDrafts[messageId] || "";

    try {
      setReplyingMessageId(messageId);
      setReplyError("");

      const response = await fetch(`/api/messages/${messageId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ replyText })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setReplyDrafts((current) => ({ ...current, [messageId]: "" }));
      await fetchMessages();
      await fetchUnreadMessageCount();
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setReplyingMessageId(null);
    }
  }

  function updateRunForm(event) {
    const { name, value } = event.target;
    setRunForm((current) => ({ ...current, [name]: value }));
  }

  function parseKilometers(value) {
    const normalized = String(value).trim().replace(",", ".");
    const kilometers = Number(normalized);

    if (!Number.isFinite(kilometers) || kilometers <= 0) {
      throw new Error("Kilometers must be a positive number.");
    }

    return kilometers;
  }

  function startCreateRun() {
    setEditingRunId(null);
    setRunForm(EMPTY_RUN_FORM);
    setSaveMessage("");
  }

  function beginEditRun(run) {
    setEditingRunId(run.id);
    setRunForm(buildRunFormFromRun(run));
    setSaveMessage("");
    setError("");
  }

  function cancelEditRun() {
    setEditingRunId(null);
    setRunForm(EMPTY_RUN_FORM);
    setSaveMessage("");
  }

  async function submitRun(event) {
    event.preventDefault();

    try {
      setSavingRun(true);
      setSaveMessage("");
      setError("");

      const durationMinutes = Number(runForm.durationMinutes);
      if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        throw new Error("Duration must be a positive number of minutes.");
      }

      const completedOn = formatDateTimeLocal(
        new Date(new Date(runForm.startedOn).getTime() + durationMinutes * 60000)
      );
      const kilometers = parseKilometers(runForm.miles);

      const isEditing = editingRunId != null;
      const response = await fetch(isEditing ? `/api/runs/${editingRunId}` : "/api/runs", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: isEditing ? editingRunId : null,
          title: runForm.title,
          startedOn: runForm.startedOn,
          completedOn,
          miles: kilometers / KM_PER_MILE,
          location: runForm.location,
          district: runForm.district
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setRunForm(EMPTY_RUN_FORM);
      setEditingRunId(null);
      setSaveMessage(isEditing ? "Run updated." : "Run saved.");
      await fetchMyRuns();
      if (hasFetched) {
        await fetchRuns();
      }
    } catch (err) {
      setSaveMessage("");
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSavingRun(false);
    }
  }

  async function deleteRun(id) {
    try {
      setError("");
      const response = await fetch(`/api/runs/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      if (editingRunId === id) {
        cancelEditRun();
      }

      setSaveMessage("Run deleted.");
      await fetchMyRuns();
      if (hasFetched) {
        await fetchRuns();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  const hasSearchCriteria = searchTerm.trim() !== "" || districtFilter !== "ALL";
  const feedRuns =
    currentUser && hasFetchedMine && !hasSearchCriteria
      ? mergeRunsById(runs, myRuns)
      : runs;
  const myTotalKilometers = myRuns.reduce((sum, run) => sum + run.miles * KM_PER_MILE, 0);
  const myTotalMinutes = myRuns.reduce(
    (sum, run) => sum + getDurationMinutes(run.startedOn, run.completedOn),
    0
  );
  const longestMyRun = myRuns.reduce(
    (current, run) => (run.miles > current.miles ? run : current),
    { miles: 0, title: "No runs yet" }
  );

  return (
    <div className="page-shell">
      <nav className="top-nav" aria-label="Account">
        <div className="top-nav-shell">
          <div className="top-nav-brand-panel">
            <button
              type="button"
              className="brand-logo-panel"
              onClick={() => {
                setView("feed");
                setProfileMenuOpen(false);
              }}
              aria-label="Back to main page"
            >
              <img
                className="brand-logo-image"
                src="/media/final_logo.png"
                alt=""
                aria-hidden="true"
              />
              <span className="brand-wordmark" aria-hidden="true">
                <span className="brand-wordmark-jog">JOG</span>
                <span className="brand-wordmark-teams">TEAMS</span>
              </span>
            </button>
          </div>

          <div className="top-nav-profile-panel">
            <div className="auth-actions">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    className="message-inbox-button"
                    onClick={openMessagesPanel}
                    title="Messages"
                    aria-label={`Messages${unreadMessageCount > 0 ? `, ${unreadMessageCount} unread` : ""}`}
                  >
                    <span className="message-inbox-icon" aria-hidden="true">
                      ✉
                    </span>
                    {unreadMessageCount > 0 ? (
                      <span className="message-inbox-badge">{unreadMessageCount}</span>
                    ) : null}
                  </button>

                  <div className="profile-menu-wrap">
                    <button
                      type="button"
                      className={profileMenuOpen ? "profile-button active" : "profile-button"}
                      onClick={() => setProfileMenuOpen((open) => !open)}
                      aria-expanded={profileMenuOpen}
                    >
                      <span className="profile-avatar">
                        {getInitials(getDisplayName(currentUser) || currentUser.email)}
                      </span>
                      <span>
                        My profile
                        <small>{getDisplayName(currentUser)}</small>
                      </span>
                    </button>

                    {profileMenuOpen ? (
                      <div className="profile-menu">
                        <button type="button" onClick={() => openProfilePanel("analytics")}>
                          Analytics
                        </button>
                        <button type="button" onClick={() => openProfilePanel("account")}>
                          Account information
                        </button>
                        <button type="button" onClick={() => openProfilePanel("share")}>
                          Share profile
                        </button>
                        <button type="button" onClick={openMessagesPanel}>
                          Messages
                        </button>
                        <button type="button" onClick={() => openProfilePanel("runs")}>
                          My runs
                        </button>
                        <button type="button" onClick={logout}>
                          Logout
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="auth-button ghost"
                    onClick={startGoogleLogin}
                  >
                    Login with Google
                  </button>
                  <button
                    type="button"
                    className="auth-button solid"
                    onClick={startGoogleLogin}
                  >
                    Register with Google
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {currentUser && view === "profile" && profilePanel ? (
        <section className="profile-section">
          <ProfilePanel
            currentUser={currentUser}
            displayName={getDisplayName(currentUser)}
            myRuns={myRuns}
            myTotalKilometers={myTotalKilometers}
            myTotalMinutes={myTotalMinutes}
            panel={profilePanel}
            messages={messages}
            replyDrafts={replyDrafts}
            onReplyDraftChange={updateReplyDraft}
            onReply={submitReply}
            replyingMessageId={replyingMessageId}
            replyError={replyError}
            beginEditRun={beginEditRun}
            deleteRun={deleteRun}
            onContact={openJoinRunMessage}
          />
        </section>
      ) : null}

      {currentUser && view === "my-runs" ? (
        <section className="my-runs-page">
          <div className="page-heading">
            <div>
              <p className="eyebrow">My profile</p>
              <h2>My runs</h2>
            </div>
            <div className="toolbar-actions">
              <button
                type="button"
                className="primary-action"
                onClick={() => {
                  setMyRunsCreateOpen((current) => !current);
                  startCreateRun();
                }}
              >
                {myRunsCreateOpen ? "Close create run" : "Create run"}
              </button>
              <button type="button" className="secondary-action" onClick={() => setView("feed")}>
                Back to feed
              </button>
            </div>
          </div>

          <div className="profile-summary-grid">
            <article>
              <span>Runs</span>
              <strong>{myRuns.length}</strong>
            </article>
            <article>
              <span>Total kilometers</span>
              <strong>{formatDistance(myTotalKilometers)}</strong>
            </article>
            <article>
              <span>Total time</span>
              <strong>{myTotalMinutes} min</strong>
            </article>
            <article>
              <span>Average speed</span>
              <strong>{myTotalKilometers > 0 ? formatSpeed(myTotalKilometers, myTotalMinutes) : "--"}</strong>
            </article>
            <article>
              <span>Longest run</span>
              <strong>{formatDistance(longestMyRun.miles * KM_PER_MILE)}</strong>
            </article>
            <article>
              <span>Headline</span>
              <strong>{longestMyRun.title}</strong>
            </article>
          </div>

          {myRunsCreateOpen ? (
            <div className="main-action-window">
              <RunForm
                createRun={submitRun}
                runForm={runForm}
                savingRun={savingRun}
                updateRunForm={updateRunForm}
              />
              {saveMessage ? <p className="status success">{saveMessage}</p> : null}
            </div>
          ) : null}

          <section className="run-list-section">
            <RunList
              runs={myRuns}
              currentUser={currentUser}
              onEdit={beginEditRun}
              onDelete={deleteRun}
              onContact={openJoinRunMessage}
            />
          </section>
        </section>
      ) : null}

      {view === "feed" ? (
        <>
          <section className="main-actions-buttons" aria-label="Main actions">
            <button
              type="button"
              className={activeMainPanel === "create" ? "main-action-button active" : "main-action-button"}
              onClick={() => {
                setActiveMainPanel((current) => (current === "create" ? "" : "create"));
                startCreateRun();
              }}
              aria-pressed={activeMainPanel === "create"}
            >
              <div className="main-action-copy">
                <h2>Create run</h2>
                <p>{currentUser ? "Add a new run to your profile." : "Login to save runs to your profile."}</p>
              </div>
            </button>
            <button
              type="button"
              className={activeMainPanel === "search" ? "main-action-button active" : "main-action-button"}
              onClick={() => setActiveMainPanel((current) => (current === "search" ? "" : "search"))}
              aria-pressed={activeMainPanel === "search"}
            >
              <div className="main-action-copy">
                <h2>Look for run</h2>
                <p>Search by title or Dresden district.</p>
              </div>
            </button>
          </section>

          <section className="main-actions-content" aria-live="polite">
            {activeMainPanel === "create" ? (
              <div className="main-action-window">
                {currentUser ? (
                  <>
                    <RunForm
                      createRun={submitRun}
                      runForm={runForm}
                      savingRun={savingRun}
                      updateRunForm={updateRunForm}
                    />
                    {saveMessage ? <p className="status success">{saveMessage}</p> : null}
                  </>
                ) : (
                  <button type="button" className="primary-action" onClick={startGoogleLogin}>
                    Login with Google
                  </button>
                )}
              </div>
            ) : null}

            {activeMainPanel === "search" ? (
              <div className="main-action-window">
                <form
                  className="search-controls"
                  onSubmit={(event) => {
                    event.preventDefault();
                    fetchRuns({ district: districtFilter, query: searchTerm });
                  }}
                >
                  <label>
                    Search
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="River, Altstadt, evening..."
                    />
                  </label>
                  <label>
                    District
                    <select
                      value={districtFilter}
                      onChange={(event) => setDistrictFilter(event.target.value)}
                    >
                      <option value="ALL">All districts</option>
                      {DRESDEN_DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? "Searching..." : "Search runs"}
                  </button>
                </form>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      {loading ? <p className="status">Loading runs...</p> : null}
      {error ? <p className="status error">Could not load runs: {error}</p> : null}

      {view === "feed" && activeMainPanel !== "create" && hasFetched && !loading && !error ? (
        <section className="run-list-section">
          <RunList
            runs={feedRuns}
            currentUser={currentUser}
            onEdit={beginEditRun}
            onDelete={deleteRun}
            onContact={openJoinRunMessage}
            emptyMessage={searchMessage || "No runs match this filter."}
          />
        </section>
      ) : null}

      <RunEditModal
        districtOptions={DRESDEN_DISTRICTS}
        editingRunId={editingRunId}
        onClose={cancelEditRun}
        onSubmit={submitRun}
        runForm={runForm}
        savingRun={savingRun}
        updateRunForm={updateRunForm}
      />

      {joinRunTarget ? (
        <JoinRunMessageModal
          run={joinRunTarget}
          recipientLabel={joinRecipientLabel}
          message={joinMessageDraft}
          onChange={(event) => setJoinMessageDraft(event.target.value)}
          onClose={closeJoinRunMessage}
          onSubmit={submitJoinRunMessage}
          saving={sendingJoinMessage}
          error={joinMessageError}
        />
      ) : null}

      {currentUser && currentUser.needsNickname ? (
        <NicknameModal
          nickname={nicknameDraft}
          onChange={updateNickname}
          onSubmit={submitNickname}
          saving={savingNickname}
          error={nicknameError}
        />
      ) : null}

      <section className="about-section" aria-labelledby="about-us-title">
        <div className="about-panel">
          <p className="eyebrow">About us</p>
          <h2 id="about-us-title">JOGTEAMS</h2>
          <p className="lede">
            Find runs, create your own route, and connect with jogging partners
            across Dresden.
          </p>
        </div>
      </section>
    </div>
  );
}

function RunForm({ createRun, runForm, savingRun, updateRunForm }) {
  return (
    <form className="run-form" onSubmit={createRun}>
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
          {DRESDEN_DISTRICTS.map((district) => (
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
        <button type="submit" className="primary-action" disabled={savingRun}>
          {savingRun ? "Saving..." : "Publish run"}
        </button>
      </div>
    </form>
  );
}

function ProfilePanel({
  currentUser,
  displayName,
  myRuns,
  myTotalKilometers,
  myTotalMinutes,
  panel,
  messages,
  replyDrafts,
  onReplyDraftChange,
  onReply,
  replyingMessageId,
  replyError,
  beginEditRun,
  deleteRun,
  onContact
}) {
  if (panel === "analytics") {
    const averageSpeedValue = calculateAverageSpeed(myTotalKilometers, myTotalMinutes);
    const longestRunKm = myRuns.reduce((max, run) => Math.max(max, run.miles * KM_PER_MILE), 0);
    const recentRuns = [...myRuns]
      .sort((a, b) => new Date(a.startedOn).getTime() - new Date(b.startedOn).getTime())
      .slice(-5);
    const recentMaxDistance = recentRuns.reduce(
      (max, run) => Math.max(max, run.miles * KM_PER_MILE),
      1
    );
    const consistencyPercent = calculateConsistencyPercent(myRuns.length);

    return (
      <>
        <ProfileHeading currentUser={currentUser} title="Analytics" />
        <div className="analytics-panel">
          <article className="analytics-ring-card">
            <p className="eyebrow">Consistency</p>
            <div
              className="analytics-ring"
              style={{
                background: `conic-gradient(#8be7ab ${consistencyPercent}%, rgba(255,255,255,0.12) ${consistencyPercent}% 100%)`
              }}
            >
              <div className="analytics-ring-center">
                <strong>{consistencyPercent}%</strong>
                <span>active</span>
              </div>
            </div>
            <p className="analytics-ring-note">Based on how many runs you already logged.</p>
          </article>

          <div className="analytics-cards">
            <article>
              <span>Personal runs</span>
              <strong>{myRuns.length}</strong>
            </article>
            <article>
              <span>Total kilometers</span>
              <strong>{formatDistance(myTotalKilometers)} km</strong>
            </article>
            <article>
              <span>Total time</span>
              <strong>{myTotalMinutes} min</strong>
            </article>
            <article>
              <span>Average speed</span>
              <strong>{averageSpeedValue > 0 ? `${averageSpeedValue.toFixed(1)} km/h` : "--"}</strong>
            </article>
            <article>
              <span>Longest run</span>
              <strong>{formatDistance(longestRunKm)} km</strong>
            </article>
          </div>
        </div>

        <section className="analytics-chart">
          <div className="analytics-chart-head">
            <h3>Recent distance progress</h3>
            <span>Last {recentRuns.length || 0} runs</span>
          </div>
          <div className="analytics-bars">
            {recentRuns.length ? (
              recentRuns.map((run) => {
                const distanceKm = run.miles * KM_PER_MILE;
                const width = Math.max(8, Math.round((distanceKm / recentMaxDistance) * 100));

                return (
                  <div key={run.id} className="analytics-bar-row">
                    <span className="analytics-bar-label">{run.title}</span>
                    <div className="analytics-bar-track">
                      <div className="analytics-bar-fill" style={{ width: `${width}%` }} />
                    </div>
                    <strong>{formatDistance(distanceKm)} km</strong>
                  </div>
                );
              })
            ) : (
              <p className="status">No runs yet. Create your first run to see progress charts.</p>
            )}
          </div>
        </section>
      </>
    );
  }

  if (panel === "account") {
    return (
      <>
        <ProfileHeading currentUser={currentUser} title="Account information" />
        <dl className="account-list">
          <div>
            <dt>Nickname</dt>
            <dd>{displayName || "Not provided"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{currentUser.email}</dd>
          </div>
        </dl>
      </>
    );
  }

  if (panel === "share") {
    return (
      <>
        <ProfileHeading currentUser={currentUser} title="Share profile" />
        <p className="status">Shareable public profiles are not published yet.</p>
      </>
    );
  }

  if (panel === "messages") {
    return (
      <>
      <ProfileHeading currentUser={currentUser} title="Messages" />
        <RunMessagesPanel
          messages={messages}
          currentUser={currentUser}
          onReply={onReply}
          onReplyDraftChange={onReplyDraftChange}
          replyDrafts={replyDrafts}
          replyingMessageId={replyingMessageId}
          replyError={replyError}
        />
      </>
    );
  }

  return (
    <>
      <ProfileHeading currentUser={currentUser} title="My runs" />
      <RunList
        runs={myRuns}
        currentUser={currentUser}
        onEdit={beginEditRun}
        onDelete={deleteRun}
        onContact={onContact}
      />
    </>
  );
}

function ProfileHeading({ currentUser, title }) {
  return (
    <div className="profile-heading">
      <div>
        <p className="eyebrow">My profile</p>
        <h2>{title}</h2>
      </div>
      <span>{currentUser.displayName || currentUser.nickname || currentUser.name || currentUser.email}</span>
    </div>
  );
}

function RunList({ runs, currentUser, onEdit, onDelete, onContact, emptyMessage = "No runs match this filter." }) {
  if (runs.length === 0) {
    return <p className="status">{emptyMessage}</p>;
  }

  return (
    <div className="run-list">
      {runs.map((run) => {
        const duration = getDurationMinutes(run.startedOn, run.completedOn);
        const speed = formatSpeed(run.miles * KM_PER_MILE, duration);
        const isOwnRun = Boolean(
          currentUser?.email && run.userEmail && currentUser.email === run.userEmail
        );

        return (
          <article key={run.id} className="run-row">
            <div className="run-title-cell">
              <span className={run.location === "OUTDOOR" ? "tag outdoor" : "tag indoor"}>
                {labelFor(run.location)}
              </span>
              <div>
                <h3>{run.title}</h3>
                <span>
                  #{run.id} · {run.district || "No district"}
                </span>
                {isOwnRun ? <span className="run-owner-badge">Your run</span> : null}
              </div>
            </div>

            <div className="run-list-metric">
              <span>Distance</span>
              <strong>{formatDistance(run.miles * KM_PER_MILE)} km</strong>
            </div>
            <div className="run-list-metric">
              <span>Duration</span>
              <strong>{duration} min</strong>
            </div>
            <div className="run-list-metric">
              <span>Speed</span>
              <strong>{speed}</strong>
            </div>
            <div className="run-list-metric">
              <span>Start</span>
              <strong>{formatDate(run.startedOn)}</strong>
            </div>
            {isOwnRun ? (
              <div className="run-actions" aria-label={`Actions for run ${run.title}`}>
                <button
                  type="button"
                  className="run-action-button edit"
                  onClick={() => onEdit(run)}
                  title="Edit"
                  aria-label={`Edit run ${run.title}`}
                >
                  ✎
                </button>
                <DeleteRunButton run={run} onDelete={onDelete} />
              </div>
            ) : (
              <div className="run-actions" aria-label={`Contact organizer for run ${run.title}`}>
                <ContactOrganizerButton run={run} onContact={onContact} currentUser={currentUser} />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function DeleteRunButton({ run, onDelete }) {
  return (
    <button
      type="button"
      className="run-action-button delete"
      onClick={() => onDelete(run.id)}
      title="Delete"
      aria-label={`Delete run ${run.title}`}
    >
      ×
    </button>
  );
}

function ContactOrganizerButton({ run, onContact, currentUser }) {
  if (!currentUser) {
    return (
      <button
        type="button"
        className="run-action-button contact disabled"
        title="Login to contact organizer"
        aria-label={`Login to contact organizer for run ${run.title}`}
        disabled
      >
        ✉
      </button>
    );
  }

  if (!run.userEmail) {
    return (
      <button
        type="button"
        className="run-action-button contact disabled"
        title="Contact organizer"
        aria-label={`Contact organizer for run ${run.title}`}
        disabled
      >
        ✉
      </button>
    );
  }

  return (
    <button
      type="button"
      className="run-action-button contact"
      onClick={() => onContact(run)}
      title="Contact organizer"
      aria-label={`Contact organizer for run ${run.title}`}
    >
      ✉
    </button>
  );
}

function labelFor(value) {
  switch (value) {
    case "OUTDOOR":
      return "Outdoor";
    case "INDOOR":
      return "Indoor";
    default:
      return "All runs";
  }
}

function getInitials(value) {
  return value
    .split(/[.\s@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function getDurationMinutes(startedOn, completedOn) {
  const start = new Date(startedOn);
  const end = new Date(completedOn);
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

function formatSpeed(kilometers, minutes) {
  const hours = minutes / 60;
  const speed = kilometers / hours;

  if (!Number.isFinite(speed) || speed <= 0) {
    return "--";
  }

  return `${speed.toFixed(1)} km/h`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDistance(value) {
  return Number(value.toFixed(1));
}

function calculateAverageSpeed(totalKilometers, totalMinutes) {
  if (!Number.isFinite(totalKilometers) || !Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return 0;
  }
  return totalKilometers / (totalMinutes / 60);
}

function calculateConsistencyPercent(runCount) {
  if (!Number.isFinite(runCount) || runCount <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((runCount / 20) * 100));
}

function mergeRunsById(primaryRuns, secondaryRuns) {
  const merged = new Map();

  for (const run of primaryRuns) {
    merged.set(run.id, run);
  }

  for (const run of secondaryRuns) {
    merged.set(run.id, run);
  }

  return Array.from(merged.values());
}

function formatDateTimeLocal(date) {
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes())
  ].join("");
}

function toDatetimeLocalValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatDateTimeLocal(date);
}

export default App;

