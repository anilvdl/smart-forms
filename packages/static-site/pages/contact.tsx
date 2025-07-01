"use client";
import React, { useState } from "react";
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import ReCAPTCHA from "react-google-recaptcha";
import countryCodes from "@smartforms/shared/data/countryCodes";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+1",
    message: "",
  });
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState({ email: "", phone: "" });

  const MESSAGE_MAX_LENGTH = 200; // ✅ Max character limit for message

  // ✅ Handles input, textarea, and select changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    // ✅ Enforce message length restriction (max 200 characters)
    if (name === "message" && value.length > MESSAGE_MAX_LENGTH) {
      return;
    }
  
    // ✅ Phone Number: Allow only numbers (remove any non-numeric characters)
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters
      if (numericValue.length > 15) return; // Enforce max length of 15 digits
  
      setFormData({ ...formData, phone: numericValue });
  
      // ✅ Phone Validation: Allow only numbers, min 7, max 15 digits
      setErrors({
        ...errors,
        phone: numericValue.length >= 7 && numericValue.length <= 15 ? "" : "Invalid phone number",
      });
  
      return; // ✅ Prevent further execution for phone field
    }
  
    setFormData({ ...formData, [name]: value });
  
    // ✅ Email Validation
    if (name === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      setErrors({ ...errors, email: emailPattern.test(value) ? "" : "Invalid email format" });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaValue) {
      alert("Please complete the CAPTCHA to verify you are human.");
      return;
    }
    if (errors.email || errors.phone) {
      alert("Please correct the errors before submitting.");
      return;
    }
    setFormSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <div className="contact-container">
        <section className="contact-header">
          <h1>Contact Us</h1>
          <p>Have a question? Fill in the form below, and we’ll get back to you soon.</p>
        </section>

        {!formSubmitted ? (
          <form onSubmit={handleSubmit} className="contact-form">
            {/* Name */}
            <div className="form-group">
              <label>Name <span className="required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              <small>Enter your full name (e.g., John Doe).</small>
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email <span className="required">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              <small>Provide a valid email address (e.g., example@mail.com).</small>
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="form-group phone-group">
              <label>Phone Number <span className="required">*</span></label>
              <div className="phone-input">
                {/* ✅ Dynamically loaded country codes */}
                <select name="countryCode" value={formData.countryCode} onChange={handleChange} required>
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code} {country.name}
                    </option>
                  ))}
                </select>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
              <small>Enter your phone number without spaces or special characters.</small>
              {errors.phone && <p className="error">{errors.phone}</p>}
            </div>

            {/* Message */}
            <div className="form-group">
              <label>Message <span className="required">*</span></label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                maxLength={MESSAGE_MAX_LENGTH} // ✅ Restrict max length
                required
              />
              <small>Max {MESSAGE_MAX_LENGTH} characters. ({MESSAGE_MAX_LENGTH - formData.message.length} left)</small>
            </div>

            {/* CAPTCHA */}
            <div className="form-group captcha">
              <ReCAPTCHA sitekey="YOUR_RECAPTCHA_SITE_KEY" onChange={setCaptchaValue} />
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn">Submit</button>
          </form>
        ) : (
          <div className="contact-success">
            <h2>Thank you!</h2>
            <p>Your message has been successfully submitted.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}