import { useEffect, useState } from "react";

const FILTERS = ["ALL", "OUTDOOR", "INDOOR"];
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

function App() {
  const [runs, setRuns] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [myRuns, setMyRuns] = useState([]);
  const [hasFetchedMine, setHasFetchedMine] = useState(false);
  const [runForm, setRunForm] = useState(EMPTY_RUN_FORM);
  const [savingRun, setSavingRun] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [view, setView] = useState("feed");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profilePanel, setProfilePanel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [activeMainPanel, setActiveMainPanel] = useState("");

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
          await fetchMyRuns();
        }
      } catch {
        setCurrentUser(null);
      }
    }

    loadCurrentUser();
  }, []);

  async function fetchRuns({ district = "ALL", query = "" } = {}) {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();

      if (district && district !== "ALL") {
        params.set("district", district);
      }

      if (query.trim() !== "") {
        params.set("q", query.trim());
      }

      const search = params.toString();
      const response = await fetch(`/api/runs/future${search ? `?${search}` : ""}`);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setRuns(data);
      setHasFetched(true);
    } catch (err) {
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
    }
    setProfileMenuOpen(false);
  }

  function updateRunForm(event) {
    const { name, value } = event.target;
    setRunForm((current) => ({ ...current, [name]: value }));
  }

  async function createRun(event) {
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

      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: null,
          title: runForm.title,
          startedOn: runForm.startedOn,
          completedOn,
          miles: Number(runForm.miles) / KM_PER_MILE,
          location: runForm.location,
          district: runForm.district
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setRunForm(EMPTY_RUN_FORM);
      setSaveMessage("Run saved.");
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

  const visibleRuns =
    filter === "ALL"
      ? runs
      : runs.filter((run) => run.location === filter);

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
                <div className="profile-menu-wrap">
                  <button
                    type="button"
                    className={profileMenuOpen ? "profile-button active" : "profile-button"}
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    aria-expanded={profileMenuOpen}
                  >
                    <span className="profile-avatar">
                      {getInitials(currentUser.name || currentUser.email)}
                    </span>
                    <span>
                      My profile
                      <small>{currentUser.name || currentUser.email}</small>
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
                      <button type="button" onClick={() => openProfilePanel("messages")}>
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
            myRuns={myRuns}
            myTotalKilometers={myTotalKilometers}
            myTotalMinutes={myTotalMinutes}
            panel={profilePanel}
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
            <button type="button" className="primary-action" onClick={() => setView("feed")}>
              Back to feed
            </button>
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
              <span>Average pace</span>
              <strong>{myTotalKilometers > 0 ? formatPace(myTotalMinutes / myTotalKilometers) : "--"}</strong>
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

          <section className="run-list-section">
            <RunList runs={myRuns} />
          </section>
        </section>
      ) : null}

      {view === "feed" ? (
        <>
          <section className="main-actions-buttons" aria-label="Main actions">
            <button
              type="button"
              className={activeMainPanel === "create" ? "main-action-button active" : "main-action-button"}
              onClick={() => setActiveMainPanel((current) => (current === "create" ? "" : "create"))}
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
                      createRun={createRun}
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

      {!hasFetched && !loading && !error ? (
        <p className="status">Click the fetch button to load upcoming runs from SQL.</p>
      ) : null}
      {loading ? <p className="status">Loading runs from SQL...</p> : null}
      {error ? <p className="status error">Could not load runs: {error}</p> : null}

      {view === "feed" && activeMainPanel !== "create" && hasFetched && !loading && !error ? (
        <section className="run-list-section">
          <RunList runs={visibleRuns} />
        </section>
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

      <section className="toolbar">
        <div>
          <h2>Run feed</h2>
          <p>Fetch upcoming runs from the SQL database through the Spring backend.</p>
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            className="primary-action"
            onClick={fetchRuns}
            disabled={loading}
          >
            {loading ? "Fetching..." : "Fetch upcoming SQL runs"}
          </button>

          <div className="filter-row" role="tablist" aria-label="Run filters">
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                className={value === filter ? "filter active" : "filter"}
                onClick={() => setFilter(value)}
              >
                {labelFor(value)}
              </button>
            ))}
          </div>
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
          type="number"
          min="1"
          step="1"
          value={runForm.miles}
          onChange={updateRunForm}
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

      <button type="submit" className="primary-action" disabled={savingRun}>
        {savingRun ? "Publishing..." : "Publish run"}
      </button>
    </form>
  );
}

function ProfilePanel({ currentUser, myRuns, myTotalKilometers, myTotalMinutes, panel }) {
  if (panel === "analytics") {
    return (
      <>
        <ProfileHeading currentUser={currentUser} title="Analytics" />
        <div className="profile-summary-grid">
          <article>
            <span>Personal runs</span>
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
            <span>Average pace</span>
            <strong>{myTotalKilometers > 0 ? formatPace(myTotalMinutes / myTotalKilometers) : "--"}</strong>
          </article>
        </div>
      </>
    );
  }

  if (panel === "account") {
    return (
      <>
        <ProfileHeading currentUser={currentUser} title="Account information" />
        <dl className="account-list">
          <div>
            <dt>Name</dt>
            <dd>{currentUser.name || "Not provided"}</dd>
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
        <p className="status">No messages yet.</p>
      </>
    );
  }

  return (
    <>
      <ProfileHeading currentUser={currentUser} title="My runs" />
      <RunList runs={myRuns} />
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
      <span>{currentUser.email}</span>
    </div>
  );
}

function RunList({ runs }) {
  if (runs.length === 0) {
    return <p className="status">No runs match this filter.</p>;
  }

  return (
    <div className="run-list">
      {runs.map((run) => {
        const duration = getDurationMinutes(run.startedOn, run.completedOn);
        const pace = formatPace(duration / (run.miles * KM_PER_MILE));

        return (
          <article key={run.id} className="run-row">
            <div className="run-title-cell">
              <span className={run.location === "OUTDOOR" ? "tag outdoor" : "tag indoor"}>
                {labelFor(run.location)}
              </span>
              <div>
                <h3>{run.title}</h3>
                <span>#{run.id} · {run.district || "No district"}</span>
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
              <span>Pace</span>
              <strong>{pace}</strong>
            </div>
            <div className="run-list-metric">
              <span>Started</span>
              <strong>{formatDate(run.startedOn)}</strong>
            </div>
          </article>
        );
      })}
    </div>
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

function formatPace(minutesPerMile) {
  if (!Number.isFinite(minutesPerMile) || minutesPerMile <= 0) {
    return "--";
  }

  const wholeMinutes = Math.floor(minutesPerMile);
  const seconds = Math.round((minutesPerMile - wholeMinutes) * 60);
  const normalizedMinutes = seconds === 60 ? wholeMinutes + 1 : wholeMinutes;
  const normalizedSeconds = seconds === 60 ? 0 : seconds;
  return `${normalizedMinutes}:${String(normalizedSeconds).padStart(2, "0")} /km`;
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

export default App;
