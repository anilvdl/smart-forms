export default function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Describe what you need",
      desc: "Start from a template or tell SmartForms what you’re collecting — AI helps structure fields.",
    },
    {
      n: "02",
      title: "Customize & automate",
      desc: "Drag-drop layout, set validations, configure rules, notifications, and workflow routing.",
    },
    {
      n: "03",
      title: "Publish & optimize",
      desc: "Share instantly. Track analytics, improve completion rate, and iterate with confidence.",
    },
  ];

  return (
    <div>
      <h2 className="section-title">How it works</h2>
      <p className="section-subtitle">
        From idea → production form in minutes. Built for speed, clarity, and scale.
      </p>

      <div className="steps">
        {steps.map((s) => (
          <div key={s.n} className="step-card">
            <div className="step-num">{s.n}</div>
            <div className="step-content">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}