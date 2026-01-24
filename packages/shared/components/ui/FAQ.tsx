"use client";

import { useState } from "react";

type FaqItem = {
  q: string;
  a: string;
};

const FAQS: FaqItem[] = [
  {
    q: "Is SmartForms a replacement for Google Forms or JotForm?",
    a: "SmartForms focuses on AI-assisted field suggestions, validations, workflow automation, and a polished builder experience — built for modern teams.",
  },
  {
    q: "Do I need coding to use SmartForms?",
    a: "No. Drag & drop handles layout and configuration. Developers can extend via integrations/webhooks if needed.",
  },
  {
    q: "Can I embed forms into my website?",
    a: "Yes — embed and share support is part of the platform direction (based on your roadmap).",
  },
  {
    q: "Does SmartForms support integrations?",
    a: "Yes — native integrations and webhooks are designed to connect with external systems.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="faq-section">
      <div className="section-inner">
        <h2 className="section-title">FAQ</h2>
        <p className="section-subtitle">Answers to the most common questions.</p>

        <div className="faq">
          {FAQS.map((item, i) => {
            const isOpen = activeIndex === i;

            return (
              <div
                key={item.q}
                className={`faq-item ${isOpen ? "open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setActiveIndex((prev) => (prev === i ? null : i))}
                >
                  <span>{item.q}</span>
                  <span className="faq-chevron" aria-hidden="true" />
                </button>

                <div className={`faq-answer ${isOpen ? "show" : ""}`}>
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}