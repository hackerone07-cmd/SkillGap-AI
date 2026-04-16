import { Link, Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import PageLoader from "../../../components/PageLoader";
import "../style/Landing.scss"

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconSpark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Landing() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <PageLoader
        eyebrow="Opening platform"
        title="Preparing your first impression"
        description="We’re checking your session and loading the landing experience."
      />
    );
  }

  if (user) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <div className="landing-page">
      <div className="landing-page__glow landing-page__glow--left" aria-hidden="true" />
      <div className="landing-page__glow landing-page__glow--right" aria-hidden="true" />

      <header className="landing-page__topbar">
        <Link to="/" className="landing-page__brand">
          <span className="landing-page__brand-mark">IQ</span>
          <span className="landing-page__brand-text">
            <strong>Interview Copilot</strong>
            <small>Preparation that looks polished</small>
          </span>
        </Link>

        <nav className="landing-page__nav">
          <Link className="landing-page__nav-link" to="/login">
            Sign in
          </Link>
          <Link className="landing-page__nav-button" to="/register">
            Get started
          </Link>
        </nav>
      </header>

      <main className="landing-page__hero">
        <section className="landing-page__hero-copy">
          <div className="landing-page__eyebrow">
            <IconSpark />
            Built for candidates who want a cleaner edge
          </div>

          <h1>Practice for the right role with a workspace that feels credible.</h1>
          <p>
            Turn your resume and a job description into a focused interview brief with match scoring,
            likely questions, skill-gap signals, and a practical preparation roadmap.
          </p>

          <div className="landing-page__actions">
            <Link className="landing-page__primary" to="/register">
              Create your workspace
              <IconArrow />
            </Link>
            <Link className="landing-page__secondary" to="/login">
              I already have an account
            </Link>
          </div>

          <div className="landing-page__trust-row">
            <div className="landing-page__trust-card">
              <strong>Role-fit analysis</strong>
              <span>Know where you align before the interview starts.</span>
            </div>
            <div className="landing-page__trust-card">
              <strong>Technical + behavioral prep</strong>
              <span>Practice the questions most likely to matter.</span>
            </div>
            <div className="landing-page__trust-card">
              <strong>Preparation roadmap</strong>
              <span>Move from vague prep to a clear review sequence.</span>
            </div>
          </div>
        </section>

        <aside className="landing-page__showcase">
          <div className="landing-page__panel landing-page__panel--hero">
            <span className="landing-page__panel-kicker">Preview</span>
            <h2>What a first session delivers</h2>

            <div className="landing-page__score-card">
              <div>
                <span className="landing-page__score-label">Match score</span>
                <strong>87%</strong>
              </div>
              <p>Strong alignment with the role after tailoring examples around React architecture and product delivery.</p>
            </div>

            <div className="landing-page__checklist">
              <div className="landing-page__checklist-item">
                <IconCheck />
                Technical prompts matched to the job title
              </div>
              <div className="landing-page__checklist-item">
                <IconCheck />
                Behavioral answers framed around your own background
              </div>
              <div className="landing-page__checklist-item">
                <IconCheck />
                A day-by-day roadmap to close the biggest gaps
              </div>
            </div>
          </div>

          <div className="landing-page__panel landing-page__panel--metrics">
            <article>
              <strong>01</strong>
              <span>Paste the role you want</span>
            </article>
            <article>
              <strong>02</strong>
              <span>Add your resume or write your summary</span>
            </article>
            <article>
              <strong>03</strong>
              <span>Open a brief that feels ready for real prep</span>
            </article>
          </div>
        </aside>
      </main>
    </div>
  );
}
