import { useState, useEffect, useEffectEvent } from "react";
import { useParams } from "react-router-dom";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview";
import PageLoader from "../../../../components/PageLoader";

// Icons
const IconScore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="12 7 19 12 12 17 5 12 12 7"></polyline>
    <polyline points="19 12 26 16.5 19 21 12 16.5 19 12"></polyline>
    <polyline points="19 12 26 7.5 19 3 12 7.5 19 12"></polyline>
  </svg>
);

const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const IconDoc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="12" y1="13" x2="18" y2="13"></line>
    <line x1="12" y1="17" x2="18" y2="17"></line>
  </svg>
);

const IconQuestion = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v.01"></path>
    <path d="M12 8a2 2 0 0 1 2 2c0 1-1 2-2 2-1 0-2 1-2 2"></path>
  </svg>
);

const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="12" r="5"></circle>
    <circle cx="12" cy="12" r="9"></circle>
  </svg>
);

// Subcomponents
const CircleScore = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 85) return { color: "#10b981", status: "Strong match for this role" };
    if (score >= 70) return { color: "#f59e0b", status: "Good match for this role" };
    return { color: "#ef4444", status: "Needs improvement for this role" };
  };

  const { color, status } = getScoreColor(score);

  return (
    <div className="interview__score-circle-container">
      <svg className="interview__score-circle-svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" className="interview__score-circle-bg" />
        <circle
          cx="60"
          cy="60"
          r="54"
          className="interview__score-circle-progress"
          style={{
            strokeDashoffset: 339.29 - (score / 100) * 339.29,
            stroke: color,
          }}
        />
      </svg>
      <div className="interview__score-text">
        <div className="interview__score-number">{score}</div>
        <div className="interview__score-status">{status}</div>
      </div>
    </div>
  );
};

const TimelineItem = ({ day, focus, tasks }) => (
  <div className="interview__timeline-item">
    <div className="interview__timeline-marker" />
    <div className="interview__timeline-content">
      <h3>Day {day}</h3>
      <p className="interview__timeline-focus">{focus}</p>
      <ul className="interview__timeline-tasks">
        {tasks.map((task, idx) => (
          <li key={idx}>{task}</li>
        ))}
      </ul>
    </div>
  </div>
);

const SkillGapBadge = ({ skill, severity }) => {
  const getSeverityClass = (severity) => {
    return `interview__skill-badge--${severity}`;
  };

  return (
    <div className={`interview__skill-badge ${getSeverityClass(severity)}`}>
      <span className="interview__skill-badge-text">{skill}</span>
    </div>
  );
};

// Main component
export default function Interview() {
  const [activeSection, setActiveSection] = useState("road-map");
  const { interviewId } = useParams();
     
  const { report, isReportLoading, isDownloadingResume, getReportById, getResumePdf } = useInterview();

  const loadReport = useEffectEvent(async () => {
    if (interviewId) {
      await getReportById(interviewId);
    }
  });

  useEffect(() => {
    loadReport();
  }, [interviewId]);

  if (isReportLoading) {
    return (
      <PageLoader
        eyebrow="Loading report"
        title="Opening your interview brief"
        description="We’re pulling in the score, questions, and preparation roadmap for this role."
      />
    );
  }

  if (!report) {
    return (
      <PageLoader
        eyebrow="Report unavailable"
        title="No report found"
        description="This interview brief could not be loaded. Please return to the dashboard and try again."
      />
    );
  }

  return (
    <div className="interview interview--dashboard">
      {/* Left Sidebar */}
      <aside className="interview__sidebar-left">
        <div className="interview__sidebar-section">
          <h3 className="interview__sidebar-section-title">SECTIONS</h3>
          <nav className="interview__sidebar-nav">
            <button
              className={`interview__sidebar-link ${activeSection === "technical" ? "interview__sidebar-link--active" : ""}`}
              onClick={() => setActiveSection("technical")}
            >
              <IconQuestion /> Technical Questions
            </button>
            <button
              className={`interview__sidebar-link ${activeSection === "behavioral" ? "interview__sidebar-link--active" : ""}`}
              onClick={() => setActiveSection("behavioral")}
            >
              <IconQuestion /> Behavioral Questions
            </button>
            <button
              className={`interview__sidebar-link ${activeSection === "road-map" ? "interview__sidebar-link--active" : ""}`}
              onClick={() => setActiveSection("road-map")}
            >
              <IconTarget /> Road Map
            </button>
           
          </nav>
  
           <button
             style={ {marginTop: "25rem", backgroundColor:"crimson", color:"black", }}
             className="interview__sidebar-link"
             onClick={() => getResumePdf(interviewId)}
             disabled={isDownloadingResume}
           >
             <svg height={"1rem"  } style={ {marginRight: "0.5rem"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M23.9996 12.0235C17.5625 12.4117 12.4114 17.563 12.0232 24H11.9762C11.588 17.563 6.4369 12.4117 0 12.0235V11.9765C6.4369 11.5883 11.588 6.43719 11.9762 0H12.0232C12.4114 6.43719 17.5625 11.5883 23.9996 11.9765V12.0235Z"></path></svg>
               {isDownloadingResume ? "Generating Resume..." : "Generate Resume"}
            </button> 
        </div>
      </aside>

      {/* Main Content */}
      <main className="interview__main">
        <div className="interview__section-header">
          <h2>Preparation Road Map</h2>
        </div>

        {activeSection === "road-map" && (
          <div className="interview__timeline">
            {report.preparationPlan.map((day, index) => (
              <TimelineItem key={index} {...day} />
            ))}
          </div>
        )}

        {activeSection === "technical" && (
          <div className="interview__questions-list">
            {report.technicalQuestions.map((q, idx) => (
              <div key={idx} className="interview__question-item">
                <h3>{q.question}</h3>
                <div className="interview__question-section">
                  <label>Interviewer's Intent</label>
                  <p>{q.intention}</p>
                </div>
                <div className="interview__question-section">
                  <label>Sample Answer</label>
                  <p>{q.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "behavioral" && (
          <div className="interview__questions-list">
            {report.behavioralQuestions.map((q, idx) => (
              <div key={idx} className="interview__question-item">
                <h3>{q.question}</h3>
                <div className="interview__question-section">
                  <label>Interviewer's Intent</label>
                  <p>{q.intention}</p>
                </div>
                <div className="interview__question-section">
                  <label>Sample Answer</label>
                  <p>{q.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="interview__sidebar-right">
        {/* Match Score */}
        <div className="interview__score-container">
          <div className="interview__score-label">MATCH SCORE</div>
          <CircleScore score={report.matchScore} />
        </div>

        {/* Skill Gaps */}
        <div className="interview__skill-gaps">
          <div className="interview__skill-gaps-title">SKILL GAPS</div>
          <div className="interview__skill-badges">
            {report.skillGap.map((skill, idx) => (
              <SkillGapBadge key={idx} {...skill} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
