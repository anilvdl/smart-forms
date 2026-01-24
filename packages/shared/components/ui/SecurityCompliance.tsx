export default function SecurityCompliance() {
  const bullets = [
    "Role-based access patterns (least privilege)",
    "Secure transport and storage (TLS-first patterns)",
    "Audit-friendly approach (activity tracking roadmap)",
    "Compliance-ready design direction (GDPR / SOC2 alignment roadmap)",
    "Spam/bot protection patterns for public forms",
  ];

  return (
    <div className="sf-securityGrid">
      <div className="sf-securityLeft">
        <h2 className="sf-h2">Security & compliance by design</h2>
        <p className="sf-sub">
          SmartForms is built to support modern security expectations — from startups to enterprise teams.
        </p>

        <ul className="sf-securityList">
          {bullets.map((b) => (
            <li key={b}>
              <span className="sf-check">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sf-securityRight">
        <div className="sf-postureCard">
          <div className="sf-postureTop">
            <div className="sf-postureTitle">Enterprise posture</div>
            <div className="sf-posturePill">Security-first</div>
          </div>

          <p className="sf-postureDesc">
            Built on patterns that make it easier to scale across teams and customers without reworking
            fundamentals later.
          </p>

          <div className="sf-postureTags">
            <span>Auth</span>
            <span>RBAC</span>
            <span>Audit</span>
            <span>Compliance</span>
          </div>

          <div className="sf-postureFooter">
            <div className="sf-postureHint">Roadmap-friendly: add controls as usage grows.</div>
          </div>
        </div>
      </div>
    </div>
  );
}