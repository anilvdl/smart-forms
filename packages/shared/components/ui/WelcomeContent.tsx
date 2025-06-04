import FeatureCarousel from "./FeatureCarousel";
import Clients from "./Clients";
import Link from "next/link";
import { navigationUtil } from "@smartforms/shared/utils/navigationUtil";
import { Icons } from "@smartforms/shared/icons";

export default function WelcomeContent() {
  const { navigate } = navigationUtil();

  return (
    <main className="home-container">
      {/* Hero */}
      <section className="hero" 
               style={{ backgroundImage: `url("${Icons["hero-bg"].src}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center", 
                        minHeight: "50vh",
                        backgroundRepeat: "no-repeat",
                        }}>
        <div className="hero-inner">
          <h1><i>SmartForms</i> — Next-Gen AI-Powered Form Builder</h1>
          <p className="hero-sub">
            Revolutionize your data-collection with AI-driven automation, no-code drag & drop, 
            and enterprise-grade security—without the hefty price tag.
          </p>
          <Link
            href="#"
            onClick={e => { e.preventDefault(); navigate("/signup"); }}
            className="cta-button"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Why Choose SmartForms */}
      <section className="why-us bg-grey">
        <h2>Why Choose SmartForms?</h2>
        <div className="cards">
          <div className="card">
            <h3>🚀 AI-Powered Smart Forms</h3>
            <p>Auto-generate fields & validation rules based on your intent, cutting setup time in half.</p>
          </div>
          <div className="card">
            <h3>🛠 No-Code Drag & Drop</h3>
            <p>Create beautiful, custom forms with zero coding—simply drag, drop, and publish.</p>
          </div>
          <div className="card">
            <h3>🔒 Enterprise-Grade Security</h3>
            <p>HIPAA, GDPR & SOC 2 compliance built-in, so your data stays locked down.</p>
          </div>
          <div className="card">
            <h3>⚡ Seamless Integrations</h3>
            <p>Connect to Stripe, PayPal, Salesforce—or any webhook—without extra fees.</p>
          </div>
        </div>
      </section>

      {/* Feature Carousel */}
      <section className="bg-white">
        <FeatureCarousel />
      </section>

      {/* Clients Section */}
      <section className="clients bg-blue">
        <Clients />
      </section>
    </main>
  );
}