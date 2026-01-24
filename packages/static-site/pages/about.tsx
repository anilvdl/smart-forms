"use client";

import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@smartforms/shared/icons";

export default function About() {
  const stats = [
    { label: "Faster form creation", value: "3×" },
    { label: "Automation-ready workflows", value: "100%" },
    { label: "Enterprise-grade security mindset", value: "Always" },
    { label: "Integrations & extensibility", value: "Built-in" },
  ];

  const pillars = [
    {
      title: "AI-assisted building",
      desc: "Turn intent into forms in minutes—suggested fields, smart defaults, and friendly UX that stays out of your way.",
      icon: "✨",
    },
    {
      title: "Workflow automation",
      desc: "Route, validate, notify, and enrich submissions with rules that scale from simple to sophisticated.",
      icon: "⚙️",
    },
    {
      title: "Collaboration & versioning",
      desc: "Ship changes safely with draft → review → publish flows, form history, and rollback-friendly iterations.",
      icon: "🧩",
    },
    {
      title: "Insights that matter",
      desc: "Measure completion, drop-offs, and field performance so every form improves over time.",
      icon: "📈",
    },
  ];

  const values = [
    {
      title: "Craftsmanship",
      desc: "Beautiful UX and solid engineering—because your forms represent your brand.",
      icon: "🎨",
    },
    {
      title: "Trust",
      desc: "Security-first approach and privacy-aware architecture. Data protection isn’t optional.",
      icon: "🔒",
    },
    {
      title: "Speed",
      desc: "Fast to build, fast to deploy, fast for users—performance is a feature.",
      icon: "⚡",
    },
    {
      title: "Openness",
      desc: "Integrations, APIs, and flexible building blocks so SmartForms fits your ecosystem.",
      icon: "🔌",
    },
  ];

  const testimonials = [
    {
      quote:
        "We reduced back-and-forth emails by turning messy intake into a clean, guided form experience. Teams loved the clarity.",
      name: "Operations Lead",
      title: "Mid-market SaaS",
    },
    {
      quote:
        "The automation mindset is the killer feature—validation, routing, and alerts feel natural, not bolted on.",
      name: "Engineering Manager",
      title: "Platform Team",
    },
    {
      quote:
        "Our stakeholders finally get the visibility they want. We can measure drop-offs and fix the friction fast.",
      name: "Product Owner",
      title: "Digital Transformation",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="about-page">
        {/* HERO */}
        <section
          className="about-hero"
          style={{
            backgroundImage: `url("${Icons["hero-bg"].src}")`,
          }}
        >
          <div className="about-hero__overlay" />
          <div className="about-hero__glow about-hero__glow--left" />
          <div className="about-hero__glow about-hero__glow--right" />

          <div className="about-hero__inner">
            <div className="about-hero__copy">
              <p className="about-badge">
                <span className="about-badge__dot" />
                SmartForms • Built for modern teams
              </p>

              <h1 className="about-title">
                Forms that feel effortless.
                <span className="about-title__sub">Powered by AI. Designed for trust.</span>
              </h1>

              <p className="about-subtitle">
                SmartForms helps teams create high-converting forms and automation-ready workflows—with modern UX,
                real-time iteration, and integrations that scale from startup to enterprise.
              </p>

              <div className="about-cta">
                <Link href="/signup" className="btn btn--primary">
                  Start Free — No Credit Card
                </Link>
                <Link href="/products/smartforms" className="btn btn--ghost">
                  See How It Works
                </Link>
              </div>
            </div>

            <div className="about-stats">
              {stats.map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card__value">{s.value}</div>
                  <div className="stat-card__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MISSION / OVERVIEW */}
        <section className="sf-section">
          <div className="sf-grid sf-grid--2">
            <div>
              <h2 className="sf-h2">Our mission</h2>
              <p className="sf-p">
                At <strong>SmartForms</strong>, we’re building the next-generation form platform—where creating a form is only the
                beginning. Our mission is to help teams capture the right information, apply intelligent validation, automate
                follow-ups, and continuously improve conversion through insights.
              </p>

              <div className="sf-stack">
                <div className="sf-mini">
                  <div className="sf-mini__title">Designed for modern UX</div>
                  <div className="sf-mini__desc">
                    Clean layout, smart spacing, mobile-first interactions, and delightful micro-moments.
                  </div>
                </div>

                <div className="sf-mini">
                  <div className="sf-mini__title">Built to integrate</div>
                  <div className="sf-mini__desc">Plug into your stack with APIs, webhooks, and automation-friendly events.</div>
                </div>

                <div className="sf-mini">
                  <div className="sf-mini__title">Security & privacy minded</div>
                  <div className="sf-mini__desc">
                    Thoughtful defaults and architecture decisions that prioritize trust.
                  </div>
                </div>
              </div>
            </div>

            <div className="sf-card sf-card--big">
              <h3 className="sf-h3">What we believe</h3>
              <p className="sf-p sf-p--sm">
                Forms shouldn’t feel like paperwork. They should feel like a guided experience—personalized, validated, and
                connected to the workflows that matter.
              </p>

              <div className="sf-stack">
                <div className="sf-card sf-card--mini">
                  <div className="sf-mini__title">Clarity beats complexity</div>
                  <div className="sf-mini__desc">
                    Great UX is often “less” — fewer fields, better defaults, smarter logic.
                  </div>
                </div>
                <div className="sf-card sf-card--mini">
                  <div className="sf-mini__title">Automation is the new baseline</div>
                  <div className="sf-mini__desc">Submissions should trigger action—not sit in a spreadsheet.</div>
                </div>
                <div className="sf-card sf-card--mini">
                  <div className="sf-mini__title">Trust is earned daily</div>
                  <div className="sf-mini__desc">
                    Security, privacy, uptime, and transparency aren’t negotiable.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section className="sf-section">
          <div className="sf-head">
            <div>
              <h2 className="sf-h2">What makes SmartForms different</h2>
              <p className="sf-p sf-p--sm">
                A modern form builder is more than drag-and-drop. SmartForms focuses on the full lifecycle:
                build → validate → automate → measure → improve.
              </p>
            </div>
          </div>

          <div className="sf-grid sf-grid--2">
            {pillars.map((p) => (
              <div key={p.title} className="sf-feature">
                <div className="sf-feature__icon">{p.icon}</div>
                <div>
                  <h3 className="sf-h3">{p.title}</h3>
                  <p className="sf-p sf-p--sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VALUES */}
        <section className="sf-section">
          <div className="sf-card sf-card--big sf-card--soft">
            <div className="sf-grid sf-grid--2">
              <div>
                <h2 className="sf-h2">Our core values</h2>
                <p className="sf-p sf-p--sm">
                  We’re building SmartForms with long-term fundamentals: quality, trust, and a product-first mindset.
                </p>

                <div className="sf-card sf-card--mini sf-card--white">
                  <div className="sf-mini__title">Security & reliability</div>
                  <p className="sf-p sf-p--sm">
                    We design with secure patterns, least-privilege access, and privacy-aware data flows. As we grow, we aim to
                    align with widely adopted compliance expectations (audit trails, encryption practices, and more).
                  </p>
                </div>
              </div>

              <div className="sf-grid sf-grid--2 sf-grid--tight">
                {values.map((v) => (
                  <div key={v.title} className="sf-value">
                    <div className="sf-value__icon">{v.icon}</div>
                    <div className="sf-value__title">{v.title}</div>
                    <div className="sf-value__desc">{v.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="sf-section">
          <div className="sf-head">
            <div>
              <h2 className="sf-h2">Meet the team</h2>
              <p className="sf-p sf-p--sm">
                SmartForms is built by people who care about UX, performance, and real-world workflows. We’re obsessed with
                turning “form filling” into an experience users don’t hate.
              </p>
            </div>
          </div>

          <div className="sf-grid sf-grid--3">
            <div className="sf-card sf-card--team">
              <div className="sf-team">
                <Image
                  src={Icons["master"]}
                  alt="AKV"
                  width={64}
                  height={64}
                  className="sf-team__avatar"
                />
                <div>
                  <div className="sf-team__name">AKV</div>
                  <div className="sf-team__role">CEO & Founder</div>
                </div>
              </div>

              <p className="sf-p sf-p--sm">
                Platform-focused builder with a passion for clean architecture and delightful interfaces. Building SmartForms
                to help teams move faster—without sacrificing trust or usability.
              </p>

              <div className="sf-tags">
                <span className="sf-tag">Product & UX</span>
                <span className="sf-tag">Platform Engineering</span>
                <span className="sf-tag">Cloud-Native</span>
              </div>
            </div>

            <div className="sf-card sf-card--team sf-card--muted">
              <div className="sf-team__title">We’re growing</div>
              <p className="sf-p sf-p--sm">
                As SmartForms evolves, we’ll expand across design, engineering, and customer success. If you love building
                polished products, we’d love to connect.
              </p>
              <div className="sf-actions">
                <Link href="/contact" className="btn btn--outline">Contact Us</Link>
              </div>
            </div>

            <div className="sf-card sf-card--team sf-card--muted">
              <div className="sf-team__title">Partners & community</div>
              <p className="sf-p sf-p--sm">
                We believe in strong ecosystems: integrations, templates, and community knowledge that makes form workflows
                easier for everyone.
              </p>
              <div className="sf-actions">
                <Link href="/documentation" className="btn btn--outline">Explore Docs</Link>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="sf-section">
          <h2 className="sf-h2">What teams want from forms (and finally get)</h2>
          <p className="sf-p sf-p--sm">
            Clean UX for end users. Reliable automation for operators. Visibility for stakeholders.
          </p>

          <div className="sf-grid sf-grid--3">
            {testimonials.map((t) => (
              <div key={t.quote} className="sf-quote">
                <div className="sf-quote__text">“{t.quote}”</div>
                <div className="sf-quote__meta">
                  <div className="sf-quote__name">{t.name}</div>
                  <div className="sf-quote__title">{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="sf-section sf-section--cta">
          <div className="sf-cta">
            <div>
              <h2 className="sf-h2 sf-h2--light">Build forms people actually complete</h2>
              <p className="sf-p sf-p--sm sf-p--light">
                Start with templates, enhance with AI-assisted suggestions, and connect submissions to the actions that move
                your business forward.
              </p>
            </div>

            <div className="sf-cta__actions">
              <Link href="/signup" className="btn btn--dark">Get Started</Link>
              <Link href="/contact" className="btn btn--outlineLight">Talk to Us</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
