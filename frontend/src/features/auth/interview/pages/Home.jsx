import { useRef, useState } from "react";
import "../../interview/home.scss";

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

const ResultCard = ({ result, onCopy }) => (
  <div className="resume-analyzer__result">
    <div className="resume-analyzer__result-header">
      <div className="resume-analyzer__result-title">
        <span className="resume-analyzer__result-status-dot" />
        Analysis
      </div>
      <button className="resume-analyzer__result-copy-btn" onClick={onCopy}>
        Copy
      </button>
    </div>
    <div className="resume-analyzer__result-divider" />
    <div className="resume-analyzer__result-body">{result}</div>
  </div>
);

// Main component
export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [selfDesc, setSelfDesc] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!selfDesc.trim() && !pdfFile) {
      setError("Please upload your resume or fill in the 'About you' field.");
      return false;
    }

    if (!jobDesc.trim()) {
      setError("Please paste the job description.");
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!validate()) {
      return;
    }

    setError("");
    setIsLoading(true);
    setResult("");

    try {
      // TODO: Replace with your actual API call
      await new Promise((resolve) => setTimeout(resolve, 1800));
      setResult(
        `Match Score: 8/10\n\nYour profile aligns strongly with the listed requirements.\n\nKey Strengths\n- Relevant experience in the required domain\n- Strong problem-solving demonstrated in your background\n- Good cultural fit based on your self-description\n\nGaps to Address\n- Highlight leadership experience more explicitly\n- Mention specific tools or certifications\n\nTalking Points\n1. Lead with your most relevant project or achievement\n2. Quantify your impact wherever possible\n3. Show enthusiasm for the company's mission\n\nSuggested Cover Letter Opening\n"With a background in [your field] and a passion for [relevant area], I am excited to bring my skills to [Company Name]."`
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result).catch(() => {});
  };

  return (
    <div className="resume-analyzer">
      <div className="resume-analyzer__header">
        <h1>Resume Analyzer</h1>
        <p>Upload your resume, describe yourself, and paste the job description to get tailored insights.</p>
      </div>

      <div className="resume-analyzer__grid">
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
            rows={6}
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
        <button className="resume-analyzer__btn-generate" onClick={handleGenerate} disabled={isLoading}>
          {isLoading && <span className="resume-analyzer__spinner" />}
          {isLoading ? "Analyzing..." : "Generate analysis"}
          {!isLoading && <IconArrow />}
        </button>
      </div>

      {result && <ResultCard result={result} onCopy={handleCopy} />}
    </div>
  );
}
