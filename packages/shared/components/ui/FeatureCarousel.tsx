"use client";
import { useEffect, useMemo, useState } from "react";

type Feature = {
  title: string;
  desc: string;
  points: string[];
};

const FEATURES: Feature[] = [
  {
    title: "🚀 AI-Powered Suggestions",
    desc: "Get smarter forms faster — AI helps generate fields & validations based on intent.",
    points: ["Suggest fields", "Recommend validations", "Reduce setup time"],
  },
  {
    title: "🎨 Beautiful, modern UI",
    desc: "Create polished forms with responsive layouts and professional styling.",
    points: ["Layouts", "Themes", "Mobile-friendly"],
  },
  {
    title: "✅ Advanced validations",
    desc: "Reduce garbage data with clean validation rules and better error messages.",
    points: ["Required rules", "Format rules", "Conditional rules (roadmap)"],
  },
  {
    title: "📊 Analytics that improve conversion",
    desc: "See where users drop off and optimize to increase completion rate.",
    points: ["Completion rate", "Drop-off insights", "Iteration loop"],
  },
  {
    title: "⚡ Integrations & webhooks",
    desc: "Connect SmartForms to your tools and automate workflows end-to-end.",
    points: ["Webhooks", "CRM/Payments (roadmap)", "Notifications"],
  },
];

export default function FeatureCarousel() {
  const [active, setActive] = useState(0);
  const items = useMemo(() => FEATURES, []);

  useEffect(() => {
    const t = setInterval(() => setActive((x) => (x + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  const current = items[active];

  return (
    <div className="sf-featureCarousel">
      <div className="sf-featureMain">
        <div className="sf-featureLeft">
          <div className="sf-featureKicker">FEATURE HIGHLIGHT</div>
          <h3 className="sf-featureTitle">{current.title}</h3>
          <p className="sf-featureDesc">{current.desc}</p>

          <ul className="sf-featurePoints">
            {current.points.map((p) => (
              <li key={p}>✅ {p}</li>
            ))}
          </ul>

          <div className="sf-featureNav">
            <button
              className="sf-navBtn"
              onClick={() => setActive((x) => (x - 1 + items.length) % items.length)}
              aria-label="Previous feature"
              type="button"
            >
              ‹
            </button>

            <div className="sf-dots">
              {items.map((_, i) => (
                <button
                  key={i}
                  className={`sf-dotBtn ${i === active ? "active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-label={`Go to feature ${i + 1}`}
                  type="button"
                />
              ))}
            </div>

            <button
              className="sf-navBtn"
              onClick={() => setActive((x) => (x + 1) % items.length)}
              aria-label="Next feature"
              type="button"
            >
              ›
            </button>
          </div>
        </div>

        <div className="sf-featureRight">
          {/* Better “real” mock */}
          <div className="sf-previewMock">
            <div className="sf-mockHeader">
              <span className="sf-winDot r" />
              <span className="sf-winDot y" />
              <span className="sf-winDot g" />
              <span className="sf-mockHeaderTitle">Preview</span>
            </div>

            <div className="sf-mockBody">
              <div className="sf-mockLine" />
              <div className="sf-mockLine short" />

              <div className="sf-mockGrid">
                <div className="sf-mockBlock" />
                <div className="sf-mockBlock" />
                <div className="sf-mockBlock tall" />
                <div className="sf-mockBlock tall" />
              </div>

              <div className="sf-mockCTA" />
            </div>
          </div>
        </div>
      </div>

      <div className="sf-featureMiniGrid">
        {items.map((f, i) => (
          <button
            key={f.title}
            className={`sf-featureMini ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
            type="button"
          >
            <div className="sf-miniTitle">{f.title}</div>
            <div className="sf-miniDesc">{f.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}