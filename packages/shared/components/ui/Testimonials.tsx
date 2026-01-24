"use client";
import { useState } from "react";
import { CheckCircle2, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
  metric: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ravi Murthy",
    role: "Founder",
    company: "murthyastro.com",
    avatar: "⭐",
    rating: 5,
    text: "SmartForms transformed how we handle astrology consultation bookings. The drag-and-drop builder let us create a professional booking form in under 10 minutes. Client submissions increased by 40% in the first month.",
    metric: "40% more bookings",
    verified: true
  },
  {
    id: 2,
    name: "Satya Nataraj",
    role: "Creative Director",
    company: "myideas4u",
    avatar: "💡",
    rating: 5,
    text: "We integrated SmartForms for client project requests and the results have been fantastic. The form analytics showed us exactly where clients were dropping off, and after optimizing, our completion rate jumped to 85%.",
    metric: "85% completion rate",
    verified: true
  },
  {
    id: 3,
    name: "Priya Sharma",
    role: "Marketing Lead",
    company: "TechFlow Solutions",
    avatar: "👩‍💼",
    rating: 5,
    text: "Setting up lead capture forms used to take our team hours. With SmartForms, we're launching new campaigns in minutes. The versioning feature is brilliant—we can test different form layouts without breaking what's live.",
    metric: "5 hours saved per week",
    verified: true
  },
  {
    id: 4,
    name: "Amit Kumar",
    role: "Operations Manager",
    company: "EventsPro",
    avatar: "🎯",
    rating: 5,
    text: "We run 20+ events monthly and SmartForms handles all our registrations seamlessly. The auto-save feature means we never lose submissions, and the data export makes our reporting effortless. Absolutely worth it.",
    metric: "500+ registrations managed",
    verified: true
  },
  {
    id: 5,
    name: "Neha Patel",
    role: "HR Director",
    company: "GrowthStartup",
    avatar: "📋",
    rating: 5,
    text: "Job application forms are now a breeze. The conditional logic lets us show different questions based on role type, and the file upload feature for resumes works flawlessly. Our hiring process is so much smoother.",
    metric: "60% faster hiring",
    verified: true
  }
];

export default function TestimonialsProfessional() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(activeIndex + i) % testimonials.length]);
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="testimonials-pro">
      <div className="testimonials-container-pro">
        <div className="testimonials-header-pro">
          <div className="verified-badge-pro">
            <CheckCircle2 size={18} />
            Verified Reviews
          </div>
          <h2 className="section-title-pro">Loved by Teams & Individuals</h2>
          <p className="section-subtitle-pro">
            Real experiences from professionals who've transformed their workflows with SmartForms
          </p>
        </div>

        <div className="testimonials-carousel-pro">
          <button 
            className="carousel-nav-pro carousel-nav-left" 
            onClick={handlePrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="testimonials-track-pro">
            {visibleTestimonials.map((testimonial, index) => (
              <div 
                key={`${testimonial.id}-${index}`} 
                className="testimonial-card-pro"
              >
                <div className="testimonial-header-pro">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <p className="testimonial-role">{testimonial.role}</p>
                    <p className="testimonial-company">{testimonial.company}</p>
                  </div>
                  {testimonial.verified && (
                    <CheckCircle2 className="verified-check" size={24} />
                  )}
                </div>

                <div className="testimonial-rating">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>

                <p className="testimonial-text-pro">"{testimonial.text}"</p>

                <div className="testimonial-metric">
                  <Star className="metric-icon" size={20} fill="currentColor" />
                  <strong>{testimonial.metric}</strong>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="carousel-nav-pro carousel-nav-right" 
            onClick={handleNext}
            aria-label="Next testimonial"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        <div className="carousel-dots-pro">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot-pro ${index === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <div className="testimonial-stats-pro">
          <div className="stat-box-pro">
            <div className="stat-value-pro">4.9/5</div>
            <div className="stat-label-pro">Average Rating</div>
          </div>
          <div className="stat-box-pro">
            <div className="stat-value-pro">100%</div>
            <div className="stat-label-pro">Verified Reviews</div>
          </div>
          <div className="stat-box-pro">
            <div className="stat-value-pro">5+</div>
            <div className="stat-label-pro">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
}