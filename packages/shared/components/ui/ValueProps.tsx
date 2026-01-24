export default function ValueProps() {
  const items = [
    {
      title: "🤖 AI-Assisted Builder",
      desc: "Generate fields, validations, and suggestions from intent — reduce setup time dramatically.",
    },
    {
      title: "🧩 No-Code Drag & Drop",
      desc: "Create modern forms fast with layout controls, reusable components, and live preview.",
    },
    {
      title: "🔁 Workflow Automation",
      desc: "Route approvals, trigger emails, post to webhooks, or notify teams instantly.",
    },
    {
      title: "📈 Smart Analytics",
      desc: "Track conversion, drop-offs, completion time, and iterate using actionable insights.",
    },
    {
      title: "🔒 Enterprise-Ready Security",
      desc: "Security-first design: least privilege, secure storage, and compliance-friendly patterns.",
    },
    {
      title: "⚡ Integrations",
      desc: "Connect to CRMs, payment providers, and internal tools using native and webhook integrations.",
    },
  ];

  return (
    <div className="value-grid">
      {items.map((x) => (
        <div key={x.title} className="value-card">
          <h3>{x.title}</h3>
          <p>{x.desc}</p>
        </div>
      ))}
    </div>
  );
}