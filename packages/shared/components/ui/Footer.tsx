import Link from "next/link";
import TermsModal from "@smartforms/shared/modals/TermsModal";
import { navigationUtil } from "@smartforms/shared/utils/navigationUtil";

export default function Footer() {
  const { navigate } = navigationUtil();
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 SmartForm. All rights reserved.</p>
        <ul className="footer-links">
          <li><TermsModal /></li>
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="#" onClick={(e) => {
                  e.preventDefault();   // stop Next.js from navigating immediately
                  navigate(("/contact"));
                }}>Contact Us</Link></li>
        </ul>
      </div>
    </footer>
  );
}