"use client";
import { useState, useEffect } from "react";

const featureConfig = {
  enabled: true, // Set to false to hide this section
};

const features = [
  {
    id: 1,
    title: "🚀 AI-Powered Form Suggestions",
    description:
      "Automatically generate form fields based on user intent, reducing setup time and ensuring optimal experience.",
  },
  {
    id: 2,
    title: "🛠 Drag & Drop No-Code Builder",
    description:
      "Create professional-grade forms using an intuitive drag-and-drop editor with zero coding knowledge.",
  },
  {
    id: 3,
    title: "🔒 Enterprise-Grade Security",
    description:
      "Ensure data security with HIPAA, GDPR, and SOC 2 compliance, providing robust protection for sensitive data.",
  },
  {
    id: 4,
    title: "📊 Smart Analytics & Insights",
    description:
      "Analyze user behavior with advanced analytics, track form performance, and optimize your conversions.",
  },
  {
    id: 5,
    title: "⚡ Seamless Integrations",
    description:
      "Connect effortlessly with CRMs, payment gateways, and third-party apps to streamline your workflow.",
  },
];

export default function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 4000); // Switch every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % features.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  if (!featureConfig.enabled) return null;

  return (
    <div className="feature-carousel">
      {/* Left Arrow */}
      <button className="carousel-arrow left" onClick={handlePrev}>
        &#10094;
      </button>

      {/* Feature Content */}
      <div className="feature-content active">
        <h2>{features[activeIndex].title}</h2>
        <p>{features[activeIndex].description}</p>
      </div>

      {/* Right Arrow */}
      <button className="carousel-arrow right" onClick={handleNext}>
        &#10095;
      </button>

      {/* Dots Indicator */}
      <div className="carousel-dots">
        {features.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}