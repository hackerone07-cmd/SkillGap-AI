import { useRef, useState, useEffect } from "react";
import "../../interview/style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";

// Icons
const IconFile = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M3 2a1 1 0 011-1h6l4 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V2z" />
    <path d="M9 1v4h4" />
  </svg>
);

const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="8" cy="6" r="3" />
    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" strokeLinecap="round" />
  </svg>
);

const IconDoc = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
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
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// Subcomponents
const UploadZone = ({ file, onFile }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (nextFile) => {
    if (nextFile?.type === "application/pdf") {
      onFile(nextFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
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
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="resume-analyzer__upload-icon">
        <IconUpload />
      </div>
      <div className="resume-analyzer__upload-text">
        <strong>Click to upload</strong> or drag & drop
      </div>
      <div className="resume-analyzer__upload-text resume-analyzer__upload-text--hint">
        PDF only
      </div>
      {file && <div className="resume-analyzer__file-name">{file.name}</div>}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="resume-analyzer__file-input"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
};

// Report Card Component
const ReportCard = ({ report, onView }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#10b981";
    if (score >= 70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="resume-analyzer__report-card">
      <div className="resume-analyzer__report-header">
        <h3 className="resume-analyzer__report-title">{report.jobTitle}</h3>
        <div
          className="resume-analyzer__report-score"
          style={{ backgroundColor: getScoreColor(report.matchScore) }}
        >
          {report.matchScore}%
        </div>
      </div>
      
      <div className="resume-analyzer__report-meta">
        <span className="resume-analyzer__report-meta-item">
          <IconCalendar /> {formatDate(report.createdAt)}
        </span>
      </div>

      <p className="resume-analyzer__report-description">
        {report.jobDescription?.substring(0, 100)}...
      </p>

      <button
        className="resume-analyzer__report-btn"
        onClick={() => onView(report._id)}
      >
        <IconEye /> View Report
        <IconArrow />
      </button>
    </div>
  );
};

// Main component
export default function Home() {
  const navigate = useNavigate();

  const { loading, generateReport, reports, getAllReports } = useInterview();

  const [pdfFile, setPdfFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [selfDesc, setSelfDesc] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        await getAllReports();
      } catch (err) {
        console.error("Failed to load reports:", err);
      }
    };
    loadReports();
  }, []);

  const validate = () => {
    if (!jobTitle.trim()) {
      setError("Please enter the job title.");
      return false;
    }

    if (!selfDesc.trim() && !pdfFile) {
      setError("Please upload your resume or fill in the 'About you' field.");
      return false;
    }

    if (!jobDesc.trim()) {
      setError("Please paste the job description.");
      return false;
    }

    setError("");
    return true;
  };

  const handleGenerate = async() => {
    if (!validate()) return;
    try {
      const data = await generateReport({ 
        jobTitle, 
        jobDescription: jobDesc, 
        selfDescription: selfDesc, 
        resumeFile: pdfFile 
      });
      if (data && data._id) {
        navigate(`/interview/${data._id}`);
      } else {
        setError("Failed to generate report. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate report. Please try again.");
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/interview/${reportId}`);
  };

  if (loading) {
    return <main><h1>Loading your interview plan</h1></main>;
  }
  return (
    <div className="resume-analyzer">
      <div className="resume-analyzer__header">
        <h1>Resume Analyzer</h1>
        <p>Upload your resume, describe yourself, and paste the job description to get tailored insights.</p>
      </div>

      <div className="resume-analyzer__grid">
        <div className="resume-analyzer__card" style={{gridColumn: "1 / -1"}}>
          <div className="resume-analyzer__label">
            <IconDoc /> Job Title <span style={{color: "red", fontWeight: "bold"}}>*</span>
          </div>
          <input
            type="text"
            className="resume-analyzer__textarea"
            placeholder="e.g., Senior React Developer, Full Stack Engineer..."
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            maxLength={200}
            required
          />
          <div className="resume-analyzer__char-hint">{jobTitle.length} / 200</div>
        </div>

        <div className="resume-analyzer__card">
          <div className="resume-analyzer__label">
            <IconFile /> Resume (PDF)
          </div>
          <UploadZone file={pdfFile} onFile={setPdfFile} />
        </div>

        <div className="resume-analyzer__card">
          <div className="resume-analyzer__label">
            <IconUser /> About you
          </div>
          <textarea
            className="resume-analyzer__textarea"
            rows={5}
            placeholder="Briefly describe yourself - your background, strengths, career goals, and what makes you a strong candidate..."
            value={selfDesc}
            onChange={(e) => setSelfDesc(e.target.value)}
            maxLength={1000}
          />
          <div className="resume-analyzer__char-hint">{selfDesc.length} / 1000</div>
        </div>
      </div>

      <div className="resume-analyzer__card resume-analyzer__card--full">
        <div className="resume-analyzer__label">
          <IconDoc /> Job description
        </div>
        <textarea
          className="resume-analyzer__textarea resume-analyzer__textarea--job"
          rows={6}
          placeholder="Paste the full job description here - role, responsibilities, required qualifications, and any other details..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          maxLength={3000}
        />
        <div className="resume-analyzer__char-hint">{jobDesc.length} / 3000</div>
      </div>

      {error && <div className="resume-analyzer__error">{error}</div>}

      <div className="resume-analyzer__btn-row">
        <button className="resume-analyzer__btn-generate" onClick={handleGenerate}>
          Generate analysis
          <IconArrow />
        </button>
      </div>

      {reports && reports.length > 0 && (
        <section className="resume-analyzer__reports-section">
          <div className="resume-analyzer__reports-header">
            <h2>Your Generated Reports ({reports.length})</h2>
            <p>Access your previous interview analysis reports</p>
          </div>
          
          <div className="resume-analyzer__reports-grid">
            {reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onView={handleViewReport}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
