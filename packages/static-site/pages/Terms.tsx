"use client";

import Link from "next/link";

export default function Terms() {
  return (
    <main className="terms-container">
      <section className="terms-header">
        <h1>Terms & Conditions</h1>
        <p>Last Updated: March 2025</p>
      </section>

      <section className="terms-content">
        <h2>1. Introduction</h2>
        <p>
          Welcome to SmartForms. By accessing and using our website, you agree to comply 
          with the following terms and conditions.
        </p>

        <h2>2. Use of Services</h2>
        <p>
          SmartForms grants you a limited, non-exclusive, and revocable license to use 
          our platform in accordance with our policies.
        </p>

        <h2>3. Privacy & Data Protection</h2>
        <p>
          Your privacy is important to us. Please read our 
          <Link href="/privacy">Privacy Policy</Link> to understand how we collect and use your data.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          All content, branding, and software on this platform are protected under applicable 
          copyright and trademark laws.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          We are not responsible for any indirect, incidental, or consequential damages 
          arising from your use of SmartForms.
        </p>

        <h2>6. Changes to Terms</h2>
        <p>
          SmartForms reserves the right to update these terms at any time. Continued use 
          of our services constitutes acceptance of the revised terms.
        </p>
      </section>
    </main>
  );
}