import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NavbarToggle() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Only OWNER/ADMIN
  const isAdminUser = session?.user && ["OWNER", "ADMIN"].includes((session.user as any).role);

  // Are we on an admin page?
  const onAdminPage = pathname.startsWith("/admin");

  // Are we on a designer page?
  const onDesignerPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/form-builder");

  if (!isAdminUser) return null;

  if (onAdminPage) {
    return (
      <button
        onClick={() => router.push("/dashboard")}
        className="logout-btn-blue"
        title="Switch to Designer"
      >
        Switch to Designer
      </button>
    );
  }

  if (onDesignerPage) {
    return (
      <button
        onClick={() => router.push("/admin/dashboard")}
        className="logout-btn-blue"
        title="Go to Admin Console"
      >
        Admin Console
      </button>
    );
  }

  return null;
}