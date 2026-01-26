"use client";

import { useCallback, useMemo, useState } from "react";
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@smartforms/shared/icons";

type Stat = { label: string; value: string };
type Pillar = { title: string; desc: string; icon: string };
type Value = { title: string; desc: string; icon: string };
type Testimonial = { quote: string; name: string; title: string };

type TeamProfile = {
  id: string;
  name: string;
  role: string;
  orgLine?: string;
  avatarType: "image" | "initials";
  avatarSrc?: any;
  initials?: string;

  bio: string[];
  highlights?: string[];
  focusPills?: string[];
  tags?: string[];
  links?: { label: string; href: string }[];
};

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return (i % len + len) % len;
}

export default function About() {
  // HERO (UNCHANGED)
  const stats: Stat[] = [
    { label: "Faster form creation", value: "3×" },
    { label: "Automation-ready workflows", value: "100%" },
    { label: "Enterprise-grade security mindset", value: "Always" },
    { label: "Integrations & extensibility", value: "Built-in" },
  ];

  // SECTION 3 (Differentiators)
  const pillars: Pillar[] = [
    {
      title: "AI-assisted form building",
      desc: "Translate intent into forms in minutes with suggested fields, smart defaults, and UX patterns that stay out of the user’s way.",
      icon: "✨",
    },
    {
      title: "Workflow automation",
      desc: "Route, validate, notify, and enrich submissions using rules that scale from simple workflows to complex operational logic.",
      icon: "⚙️",
    },
    {
      title: "Collaboration & versioning",
      desc: "Draft, review, and publish changes safely with form history and rollback-friendly iterations designed for real teams.",
      icon: "🧩",
    },
    {
      title: "Insights that matter",
      desc: "Measure completion rates, drop-offs, and field-level performance so every form improves over time.",
      icon: "📈",
    },
  ];

  // SECTION 5 (Values)
  const values: Value[] = [
    {
      title: "Craftsmanship",
      desc: "Thoughtful UX and solid engineering—because your forms represent your brand.",
      icon: "🎨",
    },
    {
      title: "Trust",
      desc: "Security, privacy, and reliability are built into the foundation.",
      icon: "🔒",
    },
    {
      title: "Speed",
      desc: "Fast to build, fast to deploy, fast for users—performance is a feature.",
      icon: "⚡",
    },
    {
      title: "Openness",
      desc: "APIs, integrations, and flexible building blocks that fit your ecosystem.",
      icon: "🔌",
    },
  ];

  // SECTION 7 (Testimonials)
  const testimonials: Testimonial[] = [
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

  // SECTION 6 (Team Carousel) — extensible: add more profiles here
  const team: TeamProfile[] = useMemo(
    () => [
      {
        id: "akv",
        name: "AKV",
        role: "CEO & Founder",
        orgLine: "SmartForms",
        avatarType: "image",
        avatarSrc: Icons["master"],
        bio: [
          "Senior Solutions / Principal Architect focused on enterprise technology solutions architecture with deep experience in platform engineering and digital transformation.",
          "Designed and implemented an internal “Automator” framework-version upgrade tool adopted broadly across an organization—built to keep stacks current, safe, and developer-friendly.",
          "Building SmartForms to turn form workflows into reliable systems: lower operational friction, higher completion rates, and trustworthy automation from day one.",
        ],
        highlights: [
          "Architecture-first product thinking (UX + systems)",
          "Serverless + cloud-native delivery patterns",
          "Reliability, observability, and secure-by-default design",
        ],
        focusPills: ["Platform Engineering", "Workflow Automation", "Cloud-Native Architecture", "UX + Systems Thinking"],
        tags: ["Product & UX", "Platform Engineering", "Cloud-Native"],
        // links: [
        //   { label: "Contact", href: "/contact" },
        //   { label: "Docs", href: "/documentation" },
        // ],
      },
      // {
      //   id: "eng-mgr",
      //   name: "Engineering Manager",
      //   role: "Platform & Reliability",
      //   avatarType: "initials",
      //   initials: "EM",
      //   bio: [
      //     "Owns delivery velocity and operational excellence—drives roadmap execution, quality gates, incident learning, and scalable engineering practices across teams.",
      //     "Partners closely with product and architecture to keep foundations strong while shipping user-facing value quickly.",
      //   ],
      //   highlights: [
      //     "Delivery leadership and execution clarity",
      //     "SRE mindset (SLOs, incident response, postmortems)",
      //     "Quality systems (testing strategy, release confidence)",
      //   ],
      //   focusPills: ["Delivery Leadership", "SRE Mindset", "Quality Systems", "Mentorship"],
      //   tags: ["Engineering Leadership", "Reliability", "Execution"],
      // },
      // {
      //   id: "product",
      //   name: "Product Lead",
      //   role: "Customer Value & UX",
      //   avatarType: "initials",
      //   initials: "PL",
      //   bio: [
      //     "Bridges customers and engineering—turns feedback into a crisp roadmap, validates solutions early, and ensures UX stays clean and conversion-friendly.",
      //     "Owns templates, onboarding flows, and the “finish-line experience” so teams get outcomes, not just submissions.",
      //   ],
      //   highlights: ["User research + product strategy", "Conversion & completion rate optimization", "Template & workflow design"],
      //   focusPills: ["Product Strategy", "User Research", "UX Clarity", "Growth Experiments"],
      //   tags: ["Product", "UX", "Growth"],
      // },
    ],
    []
  );

  const [teamIndex, setTeamIndex] = useState(0);
  const activeProfile = team[clampIndex(teamIndex, team.length)];

  const goPrev = useCallback(() => setTeamIndex((i) => clampIndex(i - 1, team.length)), [team.length]);
  const goNext = useCallback(() => setTeamIndex((i) => clampIndex(i + 1, team.length)), [team.length]);
  const goTo = useCallback((i: number) => setTeamIndex(clampIndex(i, team.length)), [team.length]);

  return (
    <>
      <Navbar />

      <main className="about-page">
        {/* ===========================
            HERO (KEEP UNCHANGED)
           =========================== */}
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
                SmartForms helps teams create high-converting forms and automation-ready workflows—with modern UX, real-time
                iteration, and integrations that scale from startup to enterprise.
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

        {/* ===========================
            SECTION 1 — WHY WE EXIST
           =========================== */}
        <section className="sf-section">
          <div className="sf-grid sf-grid--2">
            <div>
              <div className="sf-kicker">Why SmartForms</div>
              <h2 className="sf-h2">Forms are the front door to your business.</h2>

              <p className="sf-p">
                <strong>SmartForms</strong> exists to make form-based workflows feel effortless—for users filling them and
                for teams operating behind the scenes.
              </p>

              <p className="sf-p sf-p--sm">
                We believe forms shouldn’t just collect data. They should guide users, validate intent, trigger automation,
                and continuously improve through insight.
              </p>

              <p className="sf-p sf-p--sm">
                From customer onboarding and internal approvals to operational intake and compliance workflows, SmartForms
                helps teams capture the right information, reduce back-and-forth, and move faster—without compromising trust
                or usability.
              </p>

              <div className="sf-stack">
                <div className="sf-mini">
                  <div className="sf-mini__title">Designed for modern UX</div>
                  <div className="sf-mini__desc">
                    Guided flows, intelligent defaults, and mobile-first interactions that reduce friction and drop-offs.
                  </div>
                </div>

                <div className="sf-mini">
                  <div className="sf-mini__title">Built to integrate</div>
                  <div className="sf-mini__desc">
                    APIs, webhooks, and automation-friendly events that fit cleanly into real production systems.
                  </div>
                </div>

                <div className="sf-mini">
                  <div className="sf-mini__title">Security &amp; privacy minded</div>
                  <div className="sf-mini__desc">
                    Thoughtful defaults and architecture decisions that prioritize data protection and transparency.
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2 — WHAT WE BELIEVE */}
            <div className="sf-card sf-card--big">
              <div className="sf-kicker">Our philosophy</div>
              <h3 className="sf-h3">Simplicity scales better than complexity.</h3>

              <p className="sf-p sf-p--sm">
                High-performing teams don’t want more tools—they want fewer handoffs, clearer signals, and systems that work
                together. SmartForms is built on three foundational beliefs.
              </p>

              <div className="sf-stack">
                <div className="sf-card sf-card--mini">
                  <div className="sf-mini__title">Clarity beats complexity</div>
                  <div className="sf-mini__desc">
                    Great UX is often about subtraction. Fewer fields, smarter logic, and clearer intent produce better
                    outcomes for both users and teams.
                  </div>
                </div>

                <div className="sf-card sf-card--mini">
                  <div className="sf-mini__title">Automation is the baseline</div>
                  <div className="sf-mini__desc">
                    Submissions should trigger action—validation, routing, notifications, or enrichment—not wait to be
                    manually processed.
                  </div>
                </div>

                <div className="sf-card sf-card--mini">
                  <div className="sf-mini__title">Trust is earned daily</div>
                  <div className="sf-mini__desc">
                    Security, privacy, uptime, and transparency aren’t features. They’re expectations.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===========================
            SECTION 3 — DIFFERENTIATORS
           =========================== */}
        <section className="sf-section">
          <div className="sf-head">
            <div>
              <div className="sf-kicker">Platform differentiation</div>
              <h2 className="sf-h2">More than a form builder. A workflow platform.</h2>

              <p className="sf-p sf-p--sm">
                Drag-and-drop is table stakes. SmartForms focuses on the entire lifecycle of a form—from creation to
                automation to continuous improvement.
              </p>

              <div className="sf-lifecycle">
                <span>Build</span>
                <span className="sf-dot">→</span>
                <span>Validate</span>
                <span className="sf-dot">→</span>
                <span>Automate</span>
                <span className="sf-dot">→</span>
                <span>Measure</span>
                <span className="sf-dot">→</span>
                <span>Improve</span>
              </div>
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

        {/* ===========================
            SECTION 4 — TRUST & ENTERPRISE READINESS
           =========================== */}
        <section className="sf-section">
          <div className="sf-card sf-card--big sf-card--soft">
            <div className="sf-grid sf-grid--2 sf-grid--trust">
              {/* LEFT */}
              <div>
                <div className="sf-kicker">Trust &amp; governance</div>
                <h2 className="sf-h2">Designed for trust from day one.</h2>

                <p className="sf-p sf-p--sm">
                  SmartForms is built with a security-first mindset and a long-term view toward enterprise readiness. As
                  teams scale, trust becomes non-negotiable—and we design accordingly.
                </p>

                <div className="sf-trustPanel">
                  <div className="sf-trustPanel__title">Enterprise signals you can rely on</div>

                  <ul className="sf-trustList">
                    <li>
                      <strong>Security-first defaults</strong> — least-privilege patterns, safe configs, and practical
                      controls.
                    </li>
                    <li>
                      <strong>Privacy-aware handling</strong> — purposeful collection and transparent data flow.
                    </li>
                    <li>
                      <strong>Audit-friendly operations</strong> — governance-ready visibility as you scale{" "}
                      <span className="sf-note">(Roadmap)</span>.
                    </li>
                    <li>
                      <strong>Access controls</strong> — RBAC and SSO/SAML readiness for managed rollout{" "}
                      <span className="sf-note">(Roadmap)</span>.
                    </li>
                  </ul>

                  {/* Replace “gray lines” with icon + label rows */}
                  <div className="sf-trustPanel__mock sf-trustPanel__mock--rich">
                    <div className="sf-trustPanel__mockHeader">
                      <span className="sf-pill">Policy</span>
                      <span className="sf-pill">Workflow</span>
                      <span className="sf-pill">Audit</span>
                    </div>

                    <div className="sf-trustRow">
                      <span className="sf-dotLive" aria-hidden />
                      <div className="sf-trustRow__body">
                        <div className="sf-trustRow__label">
                          <span className="sf-trustIcon" aria-hidden>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9.5 12l1.8 1.8L15.5 9.6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          Security defaults enforced
                        </div>
                        <div className="sf-trustRow__desc">Least-privilege access patterns and safe baseline configs.</div>
                      </div>
                    </div>

                    <div className="sf-trustRow">
                      <span className="sf-dotLive sf-dotLive--blue" aria-hidden />
                      <div className="sf-trustRow__body">
                        <div className="sf-trustRow__label">
                          <span className="sf-trustIcon" aria-hidden>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M12 22s8-4 8-10V6l-8-4-8 4v6c0 6 8 10 8 10z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 11a2 2 0 100-4 2 2 0 000 4z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M8.5 16c1.2-2 5.8-2 7 0"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                          Privacy-aware data handling
                        </div>
                        <div className="sf-trustRow__desc">Purposeful collection with clear data flow and retention.</div>
                      </div>
                    </div>

                    <div className="sf-trustRow">
                      <span className="sf-dotLive sf-dotLive--indigo" aria-hidden />
                      <div className="sf-trustRow__body">
                        <div className="sf-trustRow__label">
                          <span className="sf-trustIcon" aria-hidden>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M4 4h16v16H4V4z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M7 15l2-2 3 3 5-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          Audit signals & reporting
                        </div>
                        <div className="sf-trustRow__desc">
                          Governance-friendly visibility and evidence trails <span className="sf-note">(Roadmap)</span>.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="sf-p sf-p--sm">
                  Our goal is simple: teams should feel confident running critical workflows through SmartForms.
                </p>
              </div>

              {/* RIGHT */}
              <div className="sf-stack sf-stack--grid">
                <div className="sf-card sf-card--mini sf-card--white">
                  <div className="sf-mini__title">Security-first architecture</div>
                  <div className="sf-mini__desc">
                    Least-privilege access patterns, safe defaults, and practical controls designed for real teams.
                  </div>
                </div>

                <div className="sf-card sf-card--mini sf-card--white">
                  <div className="sf-mini__title">Privacy-aware data handling</div>
                  <div className="sf-mini__desc">
                    Purposeful collection, configurable retention, and transparency around how data flows through workflows.
                  </div>
                </div>

                <div className="sf-card sf-card--mini sf-card--white">
                  <div className="sf-mini__title">Audit-friendly operations</div>
                  <div className="sf-mini__desc">
                    Operational visibility and auditability to support governance needs as you scale.{" "}
                    <span className="sf-note">(Roadmap)</span>
                  </div>
                </div>

                <div className="sf-card sf-card--mini sf-card--white">
                  <div className="sf-mini__title">Enterprise access controls</div>
                  <div className="sf-mini__desc">
                    Role-based access and SSO/SAML readiness for managed rollouts. <span className="sf-note">(Roadmap)</span>
                  </div>
                </div>

                <div className="sf-card sf-card--mini sf-card--white">
                  <div className="sf-mini__title">Reliable integrations</div>
                  <div className="sf-mini__desc">
                    Webhooks, APIs, and event-friendly patterns to connect submissions to the systems that matter.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===========================
            SECTION 5 — CORE VALUES
           =========================== */}
        <section className="sf-section">
          <div className="sf-head">
            <div>
              <div className="sf-kicker">How we build</div>
              <h2 className="sf-h2">Principles that guide our work.</h2>
              <p className="sf-p sf-p--sm">
                SmartForms is shaped by long-term fundamentals—quality over shortcuts, trust over gimmicks, and product
                thinking over surface-level features.
              </p>
            </div>
          </div>

          <div className="sf-grid sf-grid--2">
            {values.map((v) => (
              <div key={v.title} className="sf-value">
                <div className="sf-value__icon">{v.icon}</div>
                <div className="sf-value__title">{v.title}</div>
                <div className="sf-value__desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ===========================
            SECTION 6 — TEAM & ORIGIN (Carousel, 1 profile at a time)
           =========================== */}
        <section className="sf-section">
          <div className="sf-head">
            <div>
              <div className="sf-kicker">Who we are</div>
              <h2 className="sf-h2">Built by people who’ve lived the problem.</h2>
              <p className="sf-p sf-p--sm">
                SmartForms is being built by engineers and product leaders who’ve worked with real-world intake systems—from
                messy internal forms to customer workflows that break at scale.
              </p>
              <p className="sf-p sf-p--sm">
                We’re obsessed with turning “form filling” into something users don’t hate and operators can actually trust.
              </p>
            </div>

            {/* Minimal controls up-right (CSS can position nicely) */}
            <div className="sf-carousel__hud" aria-label="Team carousel controls">
              <button type="button" className="sf-carousel__btn" onClick={goPrev} aria-label="Previous profile">
                ‹
              </button>
              <div className="sf-carousel__count" aria-label="Profile position">
                {clampIndex(teamIndex, team.length) + 1}/{team.length}
              </div>
              <button type="button" className="sf-carousel__btn" onClick={goNext} aria-label="Next profile">
                ›
              </button>
            </div>
          </div>

          <div className="sf-carousel">
            <div className="sf-card sf-card--team sf-carousel__card" key={activeProfile.id}>
              <div className="sf-team">
                {activeProfile.avatarType === "image" ? (
                  <Image
                    src={activeProfile.avatarSrc}
                    alt={activeProfile.name}
                    width={64}
                    height={64}
                    className="sf-team__avatar"
                  />
                ) : (
                  <div className="sf-team__avatar sf-team__avatar--initials" aria-hidden>
                    {activeProfile.initials ?? "SF"}
                  </div>
                )}

                <div className="sf-team__meta">
                  <div className="sf-team__nameRow">
                    <div className="sf-team__name">{activeProfile.name}</div>
                    {activeProfile.orgLine ? <div className="sf-team__org">{activeProfile.orgLine}</div> : null}
                  </div>
                  <div className="sf-team__role">{activeProfile.role}</div>
                </div>
              </div>

              <div className="sf-carousel__body">
                {activeProfile.bio.map((p, idx) => (
                  <p key={idx} className="sf-p sf-p--sm">
                    {p}
                  </p>
                ))}

                {activeProfile.highlights?.length ? (
                  <div className="sf-founderHighlights sf-carousel__highlights">
                    {activeProfile.highlights.map((h) => (
                      <div key={h} className="sf-founderPill">
                        {h}
                      </div>
                    ))}
                  </div>
                ) : null}

                {activeProfile.focusPills?.length ? (
                  <div className="sf-founderHighlights">
                    {activeProfile.focusPills.map((t) => (
                      <div key={t} className="sf-founderPill">
                        {t}
                      </div>
                    ))}
                  </div>
                ) : null}

                {activeProfile.tags?.length ? (
                  <div className="sf-tags">
                    {activeProfile.tags.map((t) => (
                      <span key={t} className="sf-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                {activeProfile.links?.length ? (
                  <div className="sf-carousel__links">
                    {activeProfile.links.map((l) => (
                      <Link key={l.href} href={l.href} className="sf-inlineLink">
                        {l.label} <span aria-hidden>→</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Dots */}
              <div className="sf-carousel__dots" role="tablist" aria-label="Select profile">
                {team.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`sf-carousel__dot ${i === clampIndex(teamIndex, team.length) ? "is-active" : ""}`}
                    onClick={() => goTo(i)}
                    aria-label={`Go to ${m.name}`}
                    aria-pressed={i === clampIndex(teamIndex, team.length)}
                  />
                ))}
              </div>
            </div>

            {/* Action cards (kept as 2-col row under carousel) */}
            <div className="sf-grid sf-grid--2 sf-grid--tight sf-carousel__actionsRow">
              <Link href="/contact" className="sf-cardLink">
                <div className="sf-card sf-card--team sf-card--muted sf-card--action">
                  <div className="sf-team__title">We’re growing</div>
                  <p className="sf-p sf-p--sm">
                    As SmartForms evolves, we’ll expand across design, engineering, and customer success. If you love
                    building polished products, we’d love to connect.
                  </p>

                  <div className="sf-actionHint">
                    <span>Contact Us</span>
                    <span aria-hidden>→</span>
                  </div>
                </div>
              </Link>

              <Link href="/documentation" className="sf-cardLink">
                <div className="sf-card sf-card--team sf-card--muted sf-card--action">
                  <div className="sf-team__title">Partners &amp; community</div>
                  <p className="sf-p sf-p--sm">
                    We believe in strong ecosystems: integrations, templates, and community knowledge that makes form
                    workflows easier for everyone.
                  </p>

                  <div className="sf-actionHint">
                    <span>Explore Docs</span>
                    <span aria-hidden>→</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ===========================
            SECTION 7 — SOCIAL PROOF
           =========================== */}
        <section className="sf-section">
          <div className="sf-head">
            <div>
              <div className="sf-kicker">Outcomes</div>
              <h2 className="sf-h2">What teams finally get from forms.</h2>
              <p className="sf-p sf-p--sm">Clean UX for users. Reliable automation for operators. Visibility for stakeholders.</p>
            </div>
          </div>

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

        {/* ===========================
            SECTION 8 — CTA
           =========================== */}
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
              <Link href="/signup" className="btn btn--dark">
                Get Started
              </Link>
              <Link href="/contact" className="btn btn--outlineLight">
                Talk to Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}