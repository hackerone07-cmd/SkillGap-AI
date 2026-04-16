import "./page-loader.scss";

export default function PageLoader({
  eyebrow = "Preparing workspace",
  title = "Loading",
  description = "Please wait a moment while we get everything ready.",
}) {
  return (
    <main className="page-loader" aria-live="polite" aria-busy="true">
      <div className="page-loader__panel">
        <span className="page-loader__eyebrow">{eyebrow}</span>
        <h1 className="page-loader__title">{title}</h1>
        <p className="page-loader__description">{description}</p>

        <div className="page-loader__progress" aria-hidden="true">
          <span />
        </div>

        <div className="page-loader__signals" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </main>
  );
}
