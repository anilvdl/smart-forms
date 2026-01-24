export default function UseCases() {
  const cases = [
    {
      title: "Customer intake & onboarding",
      desc: "Capture structured requirements, trigger workflows, and keep records clean.",
    },
    {
      title: "Lead gen & marketing forms",
      desc: "High-converting landing forms with analytics and drop-off insights.",
    },
    {
      title: "HR / internal requests",
      desc: "Leave requests, equipment requests, approvals — routed automatically.",
    },
    {
      title: "Payments & registrations",
      desc: "Collect payments securely, handle event registration, and automate confirmations.",
    },
    {
      title: "Surveys & feedback loops",
      desc: "Run feedback programs and generate insights from clean responses.",
    },
    {
      title: "Operational checklists",
      desc: "Standardize data capture across teams and reduce process drift.",
    },
  ];

  return (
    <div>
      <h2 className="section-title">Use cases that ship value fast</h2>
      <p className="section-subtitle">
        SmartForms fits multiple teams — from marketing to operations — with one consistent platform.
      </p>

      <div className="usecase-grid">
        {cases.map((c) => (
          <div key={c.title} className="usecase-card">
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}