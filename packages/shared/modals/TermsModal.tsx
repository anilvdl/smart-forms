"use client";
import Link from "next/link";
import { useState } from "react";

export default function TermsModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hyperlink to open modal */}
      <Link href="#" className="terms-link" onClick={() => setIsOpen(true)}>Terms & Conditions</Link>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content scrollable" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
            <h2 className="h2">Terms & Conditions</h2>
            <p>Last Updated: March 2025</p>
            <h3 className="h3">1. Introduction</h3>
            <p>By using SmartForms, you agree to comply with the following terms and conditions.</p>
            <h3 className="h3">2. Use of Services</h3>
            <p>We grant you a non-exclusive, revocable license to use our platform.</p>
            <h3 className="h3">3. Privacy & Data Protection</h3>
            <p>Refer to our <Link href="#">Privacy Policy</Link> to learn how we handle data.</p>
            <h3 className="h3">4. Intellectual Property</h3>
            <p>All platform content is protected by copyright and trademark laws.</p>
            <h3 className="h3">5. Limitation of Liability</h3>
            <p>We are not liable for indirect or incidental damages.</p>
            <h3 className="h3">6. Changes to Terms</h3>
            <p>SmartForms reserves the right to update these terms.</p>
          </div>
        </div>
      )}
    </>
  );
}