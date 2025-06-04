"use client";
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@smartforms/shared/icons";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="about-container">
        {/* Hero Section */}
        <section className="hero" 
          style={{ backgroundImage: `url("${Icons["hero-bg"].src}")`,
            backgroundSize: "cover",
            backgroundPosition: "center", 
            minHeight: "50vh",
            backgroundRepeat: "no-repeat",
          }}
        > 
        <div className="hero-inner">
          <h1 >About Us</h1>
          <p className="hero-sub">
            Empowering businesses with AI-driven, seamless form-building solutions.
          </p>
          </div>
        </section>

        {/* Company Overview */}
        <section className="company-overview">
          <h2>Our Mission</h2>
          <p>
            At <strong>SmartForms</strong>, we revolutionize the form-building experience with 
            AI-driven automation, real-time collaboration, and seamless integrations.
          </p>
        </section>

        {/* Timeline of Milestones */}
        <section className="timeline">
          <h2>Our Journey</h2>
          <div className="timeline-container">
            <div className="timeline-item">
              <span className="timeline-year">2019</span>
              <p>Founded with a vision to simplify form-building.</p>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">2021</span>
              <p>Launched our first AI-powered form automation tool.</p>
            </div>
            <div className="timeline-item">
              <span className="timeline-year">2023</span>
              <p>Expanded to enterprise solutions and real-time collaboration.</p>
            </div>
          </div>
        </section>

        {/* Meet the Team */}
        <section className="team">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <Image src={Icons["master"]} alt="akv" width={150} height={150} className="team-photo"/>
              <h3>AKV</h3>
              <p>CEO & Founder</p>
            </div>
            <div className="team-member">
              <Image src={Icons["krish"]} alt="km" width={150} height={150} className="team-photo"/>
              <h3>KM</h3>
              <p>CITO</p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="values">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-box">
              <h3>🚀 Innovation</h3>
              <p>We continuously push the boundaries of technology.</p>
            </div>
            <div className="value-box">
              <h3>🤝 Collaboration</h3>
              <p>We believe in teamwork and community-driven growth.</p>
            </div>
            <div className="value-box">
              <h3>🔒 Security</h3>
              <p>Your data privacy and security are our top priorities.</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta">
          <h2>Join Us in Revolutionizing Form-Building</h2>
          <p>Start creating powerful forms with AI today.</p>
          <Link href="/signup" className="cta-btn">Get Started</Link>
        </section>
      </div>
      <Footer />
    </>
  );
}