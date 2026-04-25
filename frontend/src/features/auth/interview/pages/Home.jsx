import { useEffect, useEffectEvent, useRef, useState } from "react";
import "../../interview/style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";

const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M3 2a1 1 0 011-1h6l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2z" />
    <path d="M9 1v4h4" />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="6" r="3" />
    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round" />
  </svg>
);

const IconDoc = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="1" y="2" width="14" height="12" rx="2" />
    <path d="M4 6h8M4 9h5" strokeLinecap="round" />
  </svg>
);

const IconUpload = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h18" strokeLinecap="round" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" strokeLinecap="round" />
  </svg>
);

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconExit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const UploadZone = ({ file, onFile }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (nextFile) => {
    if (nextFile?.type === "application/pdf") {
      onFile(nextFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };

  const zoneClass = [
    "resume-analyzer__upload-zone",
    isDragging ? "resume-analyzer__upload-zone--dragging" : "",
    file ? "resume-analyzer__upload-zone--has-file" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={zoneClass}
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="resume-analyzer__upload-icon">
        <IconUpload />
      </div>
      <div className="resume-analyzer__upload-text">
        <strong>Select a PDF</strong> or drag it here
      </div>
      <div className="resume-analyzer__upload-text resume-analyzer__upload-text--hint">
        Resume uploads are optional if you prefer to write your summary instead.
      </div>
      {file && <div className="resume-analyzer__file-name">{file.name}</div>}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="resume-analyzer__file-input"
        onChange={(event) => handleFile(event.target.files[0])}
      />
    </div>
  );
};

const ReportCard = ({ report, onView, onDeleteClick, isDeleting }) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getScoreTone = (score) => {
    if (score >= 85) {
      return { label: "Strong fit", color: "#1f7a5c" };
    }

    if (score >= 70) {
      return { label: "Promising", color: "#b67a3c" };
    }

    return { label: "Needs work", color: "#b54747" };
  };

  const scoreTone = getScoreTone(report.matchScore);

  return (
    <article className="resume-analyzer__report-card">
      <div className="resume-analyzer__report-topline">
        <span className="resume-analyzer__report-date">
          <IconCalendar />
          {formatDate(report.createdAt)}
        </span>
        <div className="resume-analyzer__report-actions">
          <span
            className="resume-analyzer__report-chip"
            style={{ color: scoreTone.color, backgroundColor: `${scoreTone.color}14` }}
          >
            {scoreTone.label}
          </span>
          <button
            type="button"
            className="resume-analyzer__report-icon-btn"
            onClick={() => onDeleteClick(report)}
            disabled={isDeleting}
            aria-label={`Delete ${report.jobTitle} report`}
            title="Delete report"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      <div className="resume-analyzer__report-header">
        <h3 className="resume-analyzer__report-title">{report.jobTitle}</h3>
        <div className="resume-analyzer__report-score">{report.matchScore}%</div>
      </div>

      <p className="resume-analyzer__report-description">
        {report.jobDescription?.substring(0, 140) || "No job description preview available."}
        {(report.jobDescription?.length || 0) > 140 ? "..." : ""}
      </p>

      <button className="resume-analyzer__report-btn" onClick={() => onView(report._id)}>
        <IconEye />
        Open report
        <IconArrow />
      </button>
    </article>
  );
};

const ReportSkeleton = () => (
  <article className="resume-analyzer__report-card resume-analyzer__report-card--skeleton" aria-hidden="true">
    <span className="resume-analyzer__skeleton resume-analyzer__skeleton--pill" />
    <span className="resume-analyzer__skeleton resume-analyzer__skeleton--title" />
    <span className="resume-analyzer__skeleton resume-analyzer__skeleton--line" />
    <span className="resume-analyzer__skeleton resume-analyzer__skeleton--line resume-analyzer__skeleton--line-short" />
    <span className="resume-analyzer__skeleton resume-analyzer__skeleton--button" />
  </article>
);

export default function Home() {
  const navigate = useNavigate();
  const workspaceRef = useRef(null);

  const { user, handleLogout } = useAuth();
  const { isGenerating, isReportsLoading, generateReport, reports, getAllReports, removeReport } = useInterview();

  const [pdfFile, setPdfFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [selfDesc, setSelfDesc] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState("");
  const [reportPendingDelete, setReportPendingDelete] = useState(null);
  const [deletingReportId, setDeletingReportId] = useState("");

  const loadReports = useEffectEvent(async () => {
    try {
      await getAllReports();
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  });

  useEffect(() => {
    loadReports();
  }, []);

  const firstName = user?.username?.trim()?.split(" ")[0] || "there";
  const reportsCount = reports?.length || 0;
  const averageMatchScore = reportsCount
    ? Math.round(
        reports.reduce((total, report) => total + (Number(report.matchScore) || 0), 0) / reportsCount,
      )
    : 0;
  const strongestMatches = reports.filter((report) => Number(report.matchScore) >= 85).length;

  const validate = () => {
    if (!jobTitle.trim()) {
      setError("Please enter the job title.");
      return false;
    }

    if (!selfDesc.trim() && !pdfFile) {
      setError("Please upload your resume or fill in the About you field.");
      return false;
    }

    if (!jobDesc.trim()) {
      setError("Please paste the job description.");
      return false;
    }

    setError("");
    return true;
  };

  const handleGenerate = async () => {
    if (!validate()) return;

    try {
      const data = await generateReport({
        jobTitle: jobTitle.trim(),
        jobDescription: jobDesc.trim(),
        selfDescription: selfDesc.trim(),
        resumeFile: pdfFile,
      });

      if (data && data._id) {
        navigate(`/interview/${data._id}`);
        return;
      }

      setError("Failed to generate the interview plan. Please try again.");
    } catch (err) {
      setError(err.message || "Failed to generate the interview plan. Please try again.");
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/interview/${reportId}`);
  };

  const handleLogoutClick = async () => {
    const result = await handleLogout();

    if (result?.success === false) {
      setError(result.message || "Unable to sign out right now.");
      return;
    }

    navigate("/");
  };

  const jumpToWorkspace = () => {
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDeleteRequest = (report) => {
    setError("");
    setReportPendingDelete(report);
  };

  const handleDeleteCancel = () => {
    if (deletingReportId) return;
    setReportPendingDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!reportPendingDelete?._id) return;

    setDeletingReportId(reportPendingDelete._id);
    setError("");

    try {
      await removeReport(reportPendingDelete._id);
      setReportPendingDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete the report. Please try again.");
    } finally {
      setDeletingReportId("");
    }
  };

  return (
    <div className="resume-analyzer">
      <div className="resume-analyzer__halo resume-analyzer__halo--one" aria-hidden="true" />
      <div className="resume-analyzer__halo resume-analyzer__halo--two" aria-hidden="true" />

      <header className="resume-analyzer__topbar">
        <div className="resume-analyzer__brand">
          <div className="resume-analyzer__brand-mark">IQ</div>
          <div>
            <p className="resume-analyzer__brand-name">Interview Copilot</p>
            <p className="resume-analyzer__brand-copy">Clean prep for serious interviews</p>
          </div>
        </div>

        <div className="resume-analyzer__topbar-actions">
          <div className="resume-analyzer__user-chip">
            <span className="resume-analyzer__user-chip-label">Workspace</span>
            <strong>{firstName}</strong>
          </div>

          <button className="resume-analyzer__ghost-btn" onClick={handleLogoutClick}>
            <IconExit />
            Sign out
          </button>
        </div>
      </header>

      <section className="resume-analyzer__hero">
        <div className="resume-analyzer__hero-copy">
          <span className="resume-analyzer__eyebrow">Interview prep workspace</span>
          <h1>Build sharper interview plans for the roles you actually want.</h1>
          <p>
            Build a focused brief from your background and the role you want. The app turns that into
            role-fit analysis, likely interview questions, and a practical roadmap you can actually use.
          </p>

          <div className="resume-analyzer__hero-actions">
            <button className="resume-analyzer__btn-generate" onClick={jumpToWorkspace}>
              Start a new plan
              <IconArrow />
            </button>
            <span className="resume-analyzer__hero-note">Designed for a cleaner, more professional flow.</span>
          </div>
        </div>

        <aside className="resume-analyzer__hero-panel">
          <span className="resume-analyzer__hero-panel-kicker">At a glance</span>

          <div className="resume-analyzer__stat-grid">
            <article className="resume-analyzer__stat-card">
              <strong>{reportsCount}</strong>
              <span>Saved briefs</span>
            </article>

            <article className="resume-analyzer__stat-card">
              <strong>{averageMatchScore || "--"}{averageMatchScore ? "%" : ""}</strong>
              <span>Average score</span>
            </article>

            <article className="resume-analyzer__stat-card">
              <strong>{strongestMatches}</strong>
              <span>Strong matches</span>
            </article>
          </div>

          <div className="resume-analyzer__hero-list">
            <div className="resume-analyzer__hero-list-item">
              <IconCheck />
              Match score with skill-gap context
            </div>
            <div className="resume-analyzer__hero-list-item">
              <IconCheck />
              Technical and behavioral prompts
            </div>
            <div className="resume-analyzer__hero-list-item">
              <IconCheck />
              A day-by-day preparation roadmap
            </div>
          </div>
        </aside>
      </section>

      <div className="resume-analyzer__content-grid">
        <section className="resume-analyzer__workspace" ref={workspaceRef}>
          <div className="resume-analyzer__section-copy">
            <span className="resume-analyzer__section-kicker">Build the brief</span>
            <h2>Give the app the same context a strong hiring manager would look for.</h2>
            <p>
              Use a resume, a written summary, or both. Clear job requirements lead to sharper feedback
              and much better interview prompts.
            </p>
          </div>

          <div className="resume-analyzer__form-grid">
            <article className="resume-analyzer__panel resume-analyzer__panel--wide">
              <label className="resume-analyzer__label">
                <IconDoc />
                Job title
                <span className="resume-analyzer__required">*</span>
              </label>

              <input
                type="text"
                className="resume-analyzer__input"
                placeholder="Senior React Developer, Product Designer, Backend Engineer..."
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                maxLength={200}
              />

              <div className="resume-analyzer__char-hint">{jobTitle.length} / 200</div>
            </article>

            <article className="resume-analyzer__panel">
              <label className="resume-analyzer__label">
                <IconFile />
                Resume upload
              </label>
              <UploadZone file={pdfFile} onFile={setPdfFile} />
            </article>

            <article className="resume-analyzer__panel">
              <label className="resume-analyzer__label">
                <IconUser />
                About you
              </label>

              <textarea
                className="resume-analyzer__textarea"
                rows={7}
                placeholder="Summarize your background, strengths, wins, and what makes you credible for this role."
                value={selfDesc}
                onChange={(event) => setSelfDesc(event.target.value)}
                maxLength={1000}
              />

              <div className="resume-analyzer__char-hint">{selfDesc.length} / 1000</div>
            </article>

            <article className="resume-analyzer__panel resume-analyzer__panel--wide">
              <label className="resume-analyzer__label">
                <IconDoc />
                Job description
                <span className="resume-analyzer__required">*</span>
              </label>

              <textarea
                className="resume-analyzer__textarea resume-analyzer__textarea--job"
                rows={10}
                placeholder="Paste the real job description here, including responsibilities, seniority, required tools, and any company-specific context."
                value={jobDesc}
                onChange={(event) => setJobDesc(event.target.value)}
                maxLength={3000}
              />

              <div className="resume-analyzer__char-hint">{jobDesc.length} / 3000</div>
            </article>
          </div>

          {error && <div className="resume-analyzer__error">{error}</div>}

          <div className="resume-analyzer__action-row">
            <button className="resume-analyzer__btn-generate" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating && <span className="resume-analyzer__spinner" />}
              {isGenerating ? "Building your interview plan" : "Generate interview plan"}
              {!isGenerating && <IconArrow />}
            </button>

            <p className="resume-analyzer__action-caption">
              We’ll score alignment, spot skill gaps, and generate role-specific practice material.
            </p>
          </div>
        </section>

        <aside className="resume-analyzer__sidebar">
          <article className="resume-analyzer__side-card">
            <span className="resume-analyzer__side-label">Best results</span>
            <h3>Keep the inputs concrete and role-specific.</h3>

            <div className="resume-analyzer__bullet-list">
              <div className="resume-analyzer__bullet-item">
                <IconCheck />
                Use the actual title from the posting, not a broader category.
              </div>
              <div className="resume-analyzer__bullet-item">
                <IconCheck />
                Include your strongest evidence, especially wins tied to the role.
              </div>
              <div className="resume-analyzer__bullet-item">
                <IconCheck />
                Paste the full description so the analysis can catch nuance.
              </div>
            </div>
          </article>

          <article className="resume-analyzer__side-card resume-analyzer__side-card--accent">
            <span className="resume-analyzer__side-label">What you get</span>
            <h3>A polished prep package in one pass.</h3>

            <div className="resume-analyzer__deliverables">
              <div className="resume-analyzer__deliverable">
                <strong>Role-fit score</strong>
                <span>A quick signal on how closely your profile maps to the job.</span>
              </div>
              <div className="resume-analyzer__deliverable">
                <strong>Question bank</strong>
                <span>Behavioral and technical questions framed for the role you chose.</span>
              </div>
              <div className="resume-analyzer__deliverable">
                <strong>Preparation roadmap</strong>
                <span>A clear sequence of what to review and practice next.</span>
              </div>
            </div>
          </article>
        </aside>
      </div>

      <section className="resume-analyzer__reports-section">
        <div className="resume-analyzer__reports-header">
          <div>
            <span className="resume-analyzer__section-kicker">Saved briefs</span>
            <h2>Recent interview plans</h2>
            <p>Open previous work, compare role fit, or pick up where you left off.</p>
          </div>

          {isReportsLoading ? (
            <div className="resume-analyzer__loading-pill">
              <span className="resume-analyzer__spinner resume-analyzer__spinner--dark" />
              Syncing reports
            </div>
          ) : (
            <div className="resume-analyzer__reports-badge">{reportsCount} saved</div>
          )}
        </div>

        {isReportsLoading ? (
          <div className="resume-analyzer__reports-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <ReportSkeleton key={index} />
            ))}
          </div>
        ) : reportsCount > 0 ? (
          <div className="resume-analyzer__reports-grid">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onView={handleViewReport}
                onDeleteClick={handleDeleteRequest}
                isDeleting={deletingReportId === report._id}
              />
            ))}
          </div>
        ) : (
          <div className="resume-analyzer__empty-state">
            <h3>No interview plans yet</h3>
            <p>Your saved reports will appear here once you generate your first brief.</p>
          </div>
        )}
      </section>

      {reportPendingDelete && (
        <div className="resume-analyzer__modal-backdrop" role="presentation">
          <div
            className="resume-analyzer__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-report-title"
          >
            <div className="resume-analyzer__modal-icon" aria-hidden="true">
              <IconTrash />
            </div>
            <h3 id="delete-report-title">Delete this report?</h3>
            <p>
              This will permanently remove <strong>{reportPendingDelete.jobTitle}</strong> from your saved
              reports.
            </p>
            <div className="resume-analyzer__modal-actions">
              <button
                type="button"
                className="resume-analyzer__ghost-btn resume-analyzer__ghost-btn--modal"
                onClick={handleDeleteCancel}
                disabled={Boolean(deletingReportId)}
              >
                No, keep it
              </button>
              <button
                type="button"
                className="resume-analyzer__danger-btn"
                onClick={handleDeleteConfirm}
                disabled={Boolean(deletingReportId)}
              >
                {deletingReportId ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
