import React from 'react';   

interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

export default function PlanCard({
  name,
  price,
  period,
  features,
  buttonText,
  popular = false
} : PlanCardProps) {
  return (
    <div className={`plan-card${popular ? ' popular' : ''}`}>
      {/* {popular && <span className="badge-popular">Popular</span>} */}
      <h3 className="plan-name">{name}</h3>
      <p className="plan-price">
        {price}
        {period && <span className="period">/{period}</span>}
      </p>
      <ul className="features-list">
        {features.map((feat, i) => (
          <li key={i}>{feat}</li>
        ))}
      </ul>
      <button className="btn btn-primary">{buttonText}</button>
    </div>
  );
}