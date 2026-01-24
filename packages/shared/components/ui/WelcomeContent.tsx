import Link from "next/link";
import { navigationUtil } from "@smartforms/shared/utils/navigationUtil";
import { Icons } from "@smartforms/shared/icons";
import { 
  Zap, 
  Lock, 
  TrendingUp, 
  Shield,
  Wrench,
  BarChart3,
  GitBranch,
  Users,
  Smartphone,
  FileText,
  Ticket,
  MessageSquare,
  Database,
  Target,
  Heart,
  ShoppingCart,
  Check
} from "lucide-react";
import AIRoadmapProfessional from "./Airoadmap";
import TestimonialsProfessional from "./Testimonials";

export default function WelcomeContentProfessional() {
  const { navigate } = navigationUtil();

  return (
    <main className="home-container">
      <section 
        className="hero-professional"
        style={{ 
          backgroundImage: `url("${Icons["hero-bg"].src}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderRadius: "15px"
        }}
      >
        <div className="hero-grid-pro">
          {/* Left Content */}
          <div className="hero-content-pro">
            <div className="hero-badge-pro">
              <span className="pulse-dot"></span>
              🚀 Trusted by 3+ businesses & 10+ professionals
            </div>

            <h1 className="hero-title-pro">
              Build Smarter Forms.<br />
              <span className="gradient-text-pro">Automate Workflows.</span><br />
              Collect Better Data.
            </h1>

            <p className="hero-subtitle-pro">
              Revolutionary form builder with <strong>AI-ready architecture</strong>, 
              intuitive no-code drag & drop, and enterprise-grade security—without 
              the enterprise price tag.
            </p>

            <div className="hero-stats-pro">
              <div className="stat-pro">
                <strong>10hrs+</strong>
                <span>Saved/Week</span>
              </div>
              <div className="stat-pro">
                <strong>99.9%</strong>
                <span>Uptime</span>
              </div>
              <div className="stat-pro">
                <strong>SOC 2</strong>
                <span>Certified</span>
              </div>
            </div>

            <div className="hero-cta-pro">
              <Link
                href="#"
                onClick={e => { e.preventDefault(); navigate("/signup"); }}
                className="btn-pro btn-primary-pro"
              >
                Start Free Trial
                <span className="btn-arrow">→</span>
              </Link>

              <Link
                href="#features"
                className="btn-pro btn-secondary-pro"
              >
                See Features
                <span className="btn-arrow">→</span>
              </Link>
            </div>

            <div className="trust-pills-pro">
              <span>⭐⭐⭐⭐⭐ 4.9/5 rated</span>
              <span>✓ No credit card required</span>
              <span>✓ 14-day free trial</span>
            </div>
          </div>

          {/* Right Side - Form Demo */}
          <div className="hero-demo-pro">
            <div className="demo-window">
              <div className="demo-header">
                <div className="window-dots">
                  <span className="dot-pro dot-red"></span>
                  <span className="dot-pro dot-yellow"></span>
                  <span className="dot-pro dot-green"></span>
                </div>
                <span className="demo-title">SmartForms Builder</span>
              </div>

              <div className="demo-workspace">
                <div className="demo-palette">
                  <div className="palette-title">COMPONENTS</div>
                  <div className="palette-chips">
                    <div className="chip-pro">
                      <FileText className="chip-icon" />
                      <span>Text Input</span>
                    </div>
                    <div className="chip-pro">
                      <span style={{ fontSize: '18px' }}>📧</span>
                      <span>Email</span>
                    </div>
                    <div className="chip-pro">
                      <span style={{ fontSize: '18px' }}>📋</span>
                      <span>Dropdown</span>
                    </div>
                    <div className="chip-pro">
                      <Check className="chip-icon" />
                      <span>Checkbox</span>
                    </div>
                  </div>
                </div>

                <div className="demo-canvas">
                  <div className="canvas-title">FORM PREVIEW</div>
                  <div className="canvas-area">
                    <div className="field-drop">
                      <label className="field-label">Full Name</label>
                      <div className="field-input-pro"></div>
                    </div>

                    <div className="field-drop">
                      <label className="field-label">Email Address</label>
                      <div className="field-input-pro"></div>
                    </div>

                    <div className="field-drop">
                      <label className="field-label">How did you hear about us?</label>
                      <div className="field-input-pro field-select">
                        <span>Select...</span>
                        <span>▼</span>
                      </div>
                    </div>

                    <div className="submit-demo">Submit Form</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLATFORM CAPABILITIES (LIGHT) ===== */}
      <section className="section-pro bg-light-pro">
        <div className="section-header-pro">
          <h2 className="section-title-pro">Built to Scale & Perform</h2>
          <p className="section-subtitle-pro">
            Enterprise-grade platform capabilities without the enterprise complexity
          </p>
        </div>

        <div className="capabilities-grid-pro">
          <div className="capability-card-pro">
            <div className="capability-header-pro">
              <Zap className="capability-icon-pro" />
              <h3>Unlimited Forms</h3>
            </div>
            <p>
              Create as many forms as you need with no artificial limits. 
              From simple contact forms to complex multi-step applications.
            </p>
          </div>

          <div className="capability-card-pro">
            <div className="capability-header-pro">
              <Shield className="capability-icon-pro" />
              <h3>99.9% Uptime</h3>
            </div>
            <p>
              Enterprise-grade reliability you can count on. Your forms stay live 
              24/7 with automatic failover and redundancy.
            </p>
          </div>

          <div className="capability-card-pro">
            <div className="capability-header-pro">
              <TrendingUp className="capability-icon-pro" />
              <h3>Sub-Second Loading</h3>
            </div>
            <p>
              Blazing fast forms that don't slow your site down. Optimized for 
              performance with CDN delivery worldwide.
            </p>
          </div>

          <div className="capability-card-pro">
            <div className="capability-header-pro">
              <Lock className="capability-icon-pro" />
              <h3>Bank-Level Security</h3>
            </div>
            <p>
              SOC 2 compliant with end-to-end encryption, GDPR ready, and 
              HIPAA-compatible architecture for sensitive data.
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHY SMARTFORMS (WHITE) ===== */}
      <section className="section-pro bg-white-pro">
        <div className="section-header-pro">
          <h2 className="section-title-pro">Why Teams Choose SmartForms</h2>
          <p className="section-subtitle-pro">
            Everything you need to create, manage, and optimize forms—all in one platform
          </p>
        </div>

        <div className="why-grid-pro">
          <div className="why-card-pro">
            <div className="why-header-pro">
              <Wrench className="why-icon-pro" />
              <h3>No-Code Drag & Drop</h3>
            </div>
            <p>
              Create beautiful, custom forms with zero coding—simply drag, drop, and publish. 
              Professional results in minutes, not hours.
            </p>
            <ul className="feature-list-pro">
              <li>50+ pre-built templates</li>
              <li>Custom branding & themes</li>
              <li>Mobile-responsive design</li>
            </ul>
          </div>

          <div className="why-card-pro">
            <div className="why-header-pro">
              <Lock className="why-icon-pro" />
              <h3>Enterprise-Grade Security</h3>
            </div>
            <p>
              HIPAA, GDPR & SOC 2 compliance built-in from day one, so your data 
              stays locked down without complex configuration.
            </p>
            <ul className="feature-list-pro">
              <li>End-to-end encryption</li>
              <li>SSO & SAML support</li>
              <li>Complete audit logs</li>
            </ul>
          </div>

          <div className="why-card-pro">
            <div className="why-header-pro">
              <Zap className="why-icon-pro" />
              <h3>Seamless Integrations</h3>
            </div>
            <p>
              Connect to Stripe, PayPal, Salesforce, or any webhook-based system 
              without writing code or paying extra fees.
            </p>
            <ul className="feature-list-pro">
              <li>100+ native integrations</li>
              <li>Webhook & API support</li>
              <li>Zero transaction fees</li>
            </ul>
          </div>

          <div className="why-card-pro">
            <div className="why-header-pro">
              <BarChart3 className="why-icon-pro" />
              <h3>Smart Analytics</h3>
            </div>
            <p>
              Track completion rates, identify drop-off points, and optimize your 
              forms with actionable insights and real-time data.
            </p>
            <ul className="feature-list-pro">
              <li>Conversion tracking</li>
              <li>Drop-off analysis</li>
              <li>A/B testing ready</li>
            </ul>
          </div>

          <div className="why-card-pro">
            <div className="why-header-pro">
              <GitBranch className="why-icon-pro" />
              <h3>Versioning & Rollback</h3>
            </div>
            <p>
              Never lose your work. Every change is versioned automatically, letting 
              you test freely and roll back if needed.
            </p>
            <ul className="feature-list-pro">
              <li>Automatic versioning</li>
              <li>Draft & publish workflow</li>
              <li>Instant rollback</li>
            </ul>
          </div>

          <div className="why-card-pro">
            <div className="why-header-pro">
              <Users className="why-icon-pro" />
              <h3>Team Collaboration</h3>
            </div>
            <p>
              Work together seamlessly with role-based permissions, shared templates, 
              and real-time collaboration features.
            </p>
            <ul className="feature-list-pro">
              <li>Multi-user access</li>
              <li>Role-based permissions</li>
              <li>Shared form library</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== AI ROADMAP (DARK) ===== */}
      <AIRoadmapProfessional />

      {/* ===== USE CASES (LIGHT) ===== */}
      <section className="section-pro bg-light-pro">
        <div className="section-header-pro">
          <h2 className="section-title-pro">What You Can Build with SmartForms</h2>
          <p className="section-subtitle-pro">
            From simple contact forms to complex workflows—SmartForms adapts to your needs
          </p>
        </div>

        <div className="usecases-grid-pro">
          <div className="usecase-card-pro">
            <div className="usecase-header-pro">
              <Smartphone className="usecase-icon-pro" />
              <h3>Contact & Lead Forms</h3>
            </div>
            <p>Capture inquiries and grow your sales pipeline with conversion-optimized forms</p>
          </div>

          <div className="usecase-card-pro">
            <div className="usecase-header-pro">
              <FileText className="usecase-icon-pro" />
              <h3>Job Applications</h3>
            </div>
            <p>Streamline hiring with structured application forms and resume uploads</p>
          </div>

          <div className="usecase-card-pro">
            <div className="usecase-header-pro">
              <Ticket className="usecase-icon-pro" />
              <h3>Event Registration</h3>
            </div>
            <p>Manage RSVPs, ticket sales, and attendee information all in one place</p>
          </div>

          <div className="usecase-card-pro">
            <div className="usecase-header-pro">
              <MessageSquare className="usecase-icon-pro" />
              <h3>Customer Feedback</h3>
            </div>
            <p>Collect surveys, testimonials, and satisfaction ratings to improve your service</p>
          </div>

          <div className="usecase-card-pro">
            <div className="usecase-header-pro">
              <Database className="usecase-icon-pro" />
              <h3>Data Collection</h3>
            </div>
            <p>Research surveys, assessments, and structured data gathering for analysis</p>
          </div>

          <div className="usecase-card-pro">
            <div className="usecase-header-pro">
              <Target className="usecase-icon-pro" />
              <h3>Custom Workflows</h3>
            </div>
            <p>Build any form your business needs with conditional logic and automation</p>
          </div>

          <div className="usecase-card-pro">
            <div className="usecase-header-pro">
              <Heart className="usecase-icon-pro" />
              <h3>Healthcare Forms</h3>
            </div>
            <p>HIPAA-compliant patient intake, appointment scheduling, and medical surveys</p>
          </div>

          <div className="usecase-card-pro">
            <div className="usecase-header-pro">
              <ShoppingCart className="usecase-icon-pro" />
              <h3>Order Forms</h3>
            </div>
            <p>Accept payments and process custom orders with integrated payment gateways</p>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES (WHITE) ===== */}
      <section className="section-pro bg-white-pro">
        <div className="section-header-pro">
          <h2 className="section-title-pro">Enterprise-Grade Security You Can Trust</h2>
          <p className="section-subtitle-pro">
            Your data security is our top priority. We maintain the highest industry standards.
          </p>
        </div>

        <div className="trust-grid-pro">
          <div className="trust-card-pro">
            <Lock className="trust-icon-pro" />
            <h4>SOC 2 Type II</h4>
            <span>Certified</span>
          </div>

          <div className="trust-card-pro">
            <Heart className="trust-icon-pro" />
            <h4>HIPAA</h4>
            <span>Compliant</span>
          </div>

          <div className="trust-card-pro">
            <Shield className="trust-icon-pro" />
            <h4>GDPR</h4>
            <span>Ready</span>
          </div>

          <div className="trust-card-pro">
            <Lock className="trust-icon-pro" />
            <h4>ISO 27001</h4>
            <span>Certified</span>
          </div>

          <div className="trust-card-pro">
            <Shield className="trust-icon-pro" />
            <h4>PCI DSS</h4>
            <span>Level 1</span>
          </div>

          <div className="trust-card-pro">
            <Lock className="trust-icon-pro" />
            <h4>256-bit SSL</h4>
            <span>Encryption</span>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS (LIGHT) ===== */}
      <TestimonialsProfessional />

      {/* ===== CLIENT LOGOS (GRADIENT) ===== */}
      <section className="clients-pro">
        <h2>Trusted by Small Businesses & Professionals</h2>
        <p>SmartForms powers forms for innovative teams and individuals</p>

        <div className="client-logos-pro">
          <div className="client-card-pro">
            <img src={Icons["m4uicon"].src} alt="myideas4u" />
            <span className="client-name-pro">myideas4u</span>
          </div>

          <div className="client-card-pro">
            <img src={Icons["murthyastro"].src} alt="murthyastro" />
            <span className="client-name-pro">murthyastro</span>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA (DARK) ===== */}
      <section className="final-cta-pro">
        <div className="final-cta-content-pro">
          <h2>Ready to Transform Your Forms?</h2>
          <p>
            Join professionals and businesses who've already made the switch to SmartForms
          </p>

          <div className="final-cta-actions">
            <Link
              href="#"
              onClick={e => { e.preventDefault(); navigate("/signup"); }}
              className="btn-pro btn-primary-pro btn-large-pro"
            >
              Start Your Free Trial
              <span>→</span>
            </Link>

            <Link
              href="/pricing"
              className="btn-pro btn-secondary-pro btn-large-pro"
            >
              View Pricing
            </Link>
          </div>

          <div className="final-trust">
            <p>✓ No credit card required &nbsp;&nbsp; ✓ 14-day free trial &nbsp;&nbsp; ✓ Cancel anytime</p>
          </div>
        </div>
      </section>
    </main>
  );
}