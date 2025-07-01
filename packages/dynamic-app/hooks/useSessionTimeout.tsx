import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export function useSessionTimeout({
  warningTime = 60,      // seconds before expiry to warn
  onWarning,             // callback to open your modal
  onSessionExtended,     // callback after successful extend
}: {
  warningTime?: number;
  onWarning: () => void;
  onSessionExtended: (newExpiry: string) => void;
}) {
  const { data: session } = useSession();
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any old timer
    if (timeoutId) clearTimeout(timeoutId);

    if (!session?.expires) return;

    const expiresAt = new Date(session.expires).getTime();
    const now = Date.now();
    const msUntilWarning = expiresAt - now - warningTime * 1000;

    if (msUntilWarning <= 0) {
      // Already within warning window
      onWarning();
    } else {
      // Schedule the warning
      const id = setTimeout(onWarning, msUntilWarning);
      setTimeoutId(id);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [session?.expires]); // re-run whenever session.expires changes

  // Call this when the user clicks “Extend”
  const extendSession = async () => {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    if (res.ok) {
      const body = await res.json();
      onSessionExtended(body.expires);
    } else {
      // If refresh fails, force sign-out
      signOut();
    }
  };

  return { extendSession };
}