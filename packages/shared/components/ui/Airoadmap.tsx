import { Bot, Sparkles, TrendingUp, Target } from "lucide-react";

export default function AIRoadmapProfessional() {
  const roadmapFeatures = [
    {
      icon: Bot,
      title: "AI Field Suggestions",
      description: "Intelligent field recommendations based on form intent and industry best practices",
      status: "development"
    },
    {
      icon: Sparkles,
      title: "Smart Validation Rules",
      description: "Auto-generate validation logic and error messages tailored to your data types",
      status: "planned"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "AI-powered insights on completion rates, drop-off patterns, and optimization opportunities",
      status: "planned"
    },
    {
      icon: Target,
      title: "Auto-Optimization",
      description: "Continuous form improvement based on user behavior and conversion data",
      status: "research"
    }
  ];

  return (
    <section className="ai-roadmap-pro">
      <div className="ai-container-pro">
        <div className="ai-header-pro">
          <div className="ai-badge-pro">
            <span className="ai-pulse"></span>
            AI-Ready Platform
          </div>
          <h2>Built for Tomorrow's Intelligence</h2>
          <p>
            SmartForms is architected with AI at its core. Advanced automation and 
            intelligent features are actively in development to revolutionize how you build and optimize forms.
          </p>
        </div>

        <div className="roadmap-grid-pro">
          {roadmapFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="roadmap-card-pro">
                <div className="roadmap-header-pro">
                  <IconComponent className="roadmap-icon-pro" />
                  <span className={`status-badge status-${feature.status}`}>
                    {feature.status === "development" && "In Development"}
                    {feature.status === "planned" && "Planned"}
                    {feature.status === "research" && "Research Phase"}
                  </span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="roadmap-timeline">
          <div className="timeline-steps">
            <div className="timeline-step">
              <div className="timeline-dot"></div>
              <span>Foundation Complete</span>
            </div>
            <div className="timeline-line"></div>
            <div className="timeline-step active">
              <div className="timeline-dot"></div>
              <span>AI Development</span>
            </div>
            <div className="timeline-line"></div>
            <div className="timeline-step">
              <div className="timeline-dot"></div>
              <span>Full AI Suite</span>
            </div>
          </div>
          <p className="timeline-note">
            Our AI features are being developed with privacy and accuracy as top priorities. 
            Early access will be available to our Pro and Enterprise users.
          </p>
        </div>
      </div>
    </section>
  );
}