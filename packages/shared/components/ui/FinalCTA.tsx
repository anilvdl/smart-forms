import Link from "next/link";
import { navigationUtil } from "@smartforms/shared/utils/navigationUtil";

export default function FinalCTA() {
  const { navigate } = navigationUtil();

  return (
    <section className="final-cta">
      <div className="final-cta-inner">
        <h2>Ready to build smarter forms?</h2>
        <p>
          Start free today. Launch forms faster, automate workflows, and collect cleaner data.
        </p>

        <div className="final-cta-actions">
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/signup");
            }}
            className="cta-button cta-primary"
          >
            Get Started Free
          </Link>

          <Link href="#how-it-works" className="cta-button cta-secondary">
            Explore Features
          </Link>
        </div>
      </div>
    </section>
  );
}