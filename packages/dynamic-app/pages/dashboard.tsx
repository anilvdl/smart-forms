import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import { Icons } from "@smartforms/shared/icons";
import useSWR, { mutate } from "swr";
import styles from "../styles/dashboard.module.css";
import { TemplateOption } from "../types/types";

type Tab =
  | "Start a New Form"
  | "Quick Actions"
  | "Work-in-Progress"
  | "Recent Forms";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If not authenticated, redirect to /login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // PAGINATION STATE for WIP
  const [limit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);

  const tabs: Tab[] = [
    "Start a New Form",
    "Quick Actions",
    "Work-in-Progress",
    "Recent Forms",
  ];
  const [activeTab, setActiveTab] = useState<Tab>("Start a New Form");

  // Search box state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Stub data for “Start a New Form” and “Quick Actions”
  const startOptions: TemplateOption[] = [
    { name: "RSVP", image: "rsvp", link: "#" },
    { name: "Party Invite", image: "party-invite", link: "#" },
    { name: "Event Registration", image: "event-registration", link: "#" },
    { name: "Survey", image: "blank-form", link: "#" },
  ];
  const quickOptions: TemplateOption[] = [
    { name: "Favorite Templates", image: "favorite", link: "/favorites" },
    { name: "Recommended", image: "recommended", link: "#" },
  ];
  // Stub “Recent Forms” (we’ll eventually fetch real data here)
  const recentOptions: TemplateOption[] = Array.from({ length: 8 }).map(
    (_, i) => ({
      name: `Contact Us #${i + 1}`,
      image: "form1",
      link: `/recent/${i + 1}`,
      updatedAt: `Opened ${9 + Math.floor(i / 2)}:${
        (i % 2) * 30
      } AM`,
    })
  );

  // SWR fetch for drafts (Work‐in‐Progress)
  // Expecting API response array of { formId, title, rawJson, version, createdAt, updatedAt, status, thumbnail }
  const { data: drafts, error: draftsError } = useSWR<TemplateOption[]>
      (activeTab === "Work-in-Progress" ? "/api/forms/designer/drafts" : null, fetcher);

  // console.log("Drafts fetched:", JSON.stringify(drafts), "Error:", draftsError);

  // Build “currentOptions” depending on activeTab, before filtering
  const currentOptions: TemplateOption[] = useMemo(() => {
    switch (activeTab) {
      case "Start a New Form":
        return startOptions;

      case "Quick Actions":
        return quickOptions;

      case "Work-in-Progress":
        if (draftsError) {
          return [
            {
              name: "Failed to load drafts",
              image: "form1",
              link: "#",
              updatedAt: "",
            },
          ];
        }
        if (!drafts) {
          return [
            {
              name: "Loading drafts…",
              image: "form1",
              link: "#",
              updatedAt: "",
            },
          ];
        }
        return drafts.map((d) => ({
          formId: d.formId,
          name: d.name || "Untitled Draft",
          image: d.thumbnail || 'form1',
          link: `/form-builder?formId=${d.formId}&version=${d.version}`,
          updatedAt: d.updatedAt,
          content: d.content,
          version: d.version,
          status: d.status,
          thumbnail: d.thumbnail, 
        }));

      case "Recent Forms":
        return recentOptions;
    }
  }, [activeTab, drafts, draftsError]);

  // Filter based on searchTerm
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return currentOptions;
    const lower = searchTerm.toLowerCase();
    return currentOptions.filter((opt) =>
      opt.name.toLowerCase().includes(lower)
    );
  }, [searchTerm, currentOptions]);

  // Reset search when tab changes
  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  // Handle click on a WIP‐card: seed SWR cache, set “lastOrigin”, and replace URL
  function onClickDraft(opt: TemplateOption) {
    // Only for real drafts (which have formId & content & version)
    if (opt.formId && opt.content !== undefined && opt.version !== undefined) {
      // Seed SWR cache under the same key that form-builder will use:
      const swrKey = `/api/forms/designer/${opt.formId}/${opt.version}`;
      mutate(
        swrKey,
        {
          formId: opt.formId,
          title: opt.name,
          rawJson: opt.content,
          version: opt.version,
          createdAt: opt.updatedAt,
          updatedAt: opt.updatedAt,
          status: opt.status ?? "WIP",
        },
        false
      );

      // Mark “came from WIP”
      if (typeof window !== "undefined") {
        sessionStorage.setItem("lastOrigin", "wip");
      }
      // Replace so user only sees /form-builder
      router.replace(
        {
          pathname: "/form-builder",
          query: { formId: opt.formId, version: opt.version },
        },
        "/form-builder"
      );
    }
  }

  // Handle click on “Blank Form” from Start a New Form hero
  function onClickNewForm() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lastOrigin", "startNew");
    }
    router.replace("/form-builder");
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.content}>
        <div className={styles.dashboardCard}>
          {/* ===== HEADER ROW ===== */}
          <div className={styles.headerRow}>
            <div>
              <h2 className={styles.title}>
                Welcome, {session?.user?.name || "User"}!
              </h2>
              <p className={styles.subtitle}>
                Start building your next form or access your recent work.
              </p>
            </div>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search forms…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ===== TABS ===== */}
          <div className={styles.cardTabs}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${
                  activeTab === tab ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ===== HERO PANEL ===== */}
          <div className={styles.cardHero}>
            {activeTab === "Start a New Form" && (
              <>
                <div className={styles.heroIcon}>📋</div>
                <div className={styles.heroContent}>
                  <h3>Create From Scratch</h3>
                  <p>
                    Pick a blank canvas or one of our curated templates to
                    start building.
                  </p>
                  <button
                    className={styles.btnPrimary}
                    onClick={onClickNewForm}
                  >
                    Blank Form →
                  </button>
                </div>
              </>
            )}
            {activeTab === "Quick Actions" && (
              <>
                <div className={styles.heroIcon}>⚡</div>
                <div className={styles.heroContent}>
                  <h3>Quick Shortcuts</h3>
                  <p>Jump straight into your favorite templates and features.</p>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => router.push("/favorites")}
                  >
                    View Favorites →
                  </button>
                </div>
              </>
            )}
            {activeTab === "Work-in-Progress" && (
              <>
                <div className={styles.heroIcon}>📝</div>
                <div className={styles.heroContent}>
                  <h3>Continue Your Drafts</h3>
                  <p>Pick up your work where you left off.</p>
                </div>
                {draftsError ? (
                  <p className={styles.heroMessage}>Failed to load drafts.</p>
                ) : !drafts ? (
                  <p className={styles.heroMessage}>Loading drafts…</p>
                ) : null}
              </>
            )}
            {activeTab === "Recent Forms" && (
              <>
                <div className={styles.heroIcon}>🕑</div>
                <div className={styles.heroContent}>
                  <h3>Your Recent Forms</h3>
                  <p>See the forms you’ve opened most recently.</p>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => router.push("/recent")}
                  >
                    View All →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ===== CARD GRID (FILTERED) ===== */}
          <div className={styles.cardGrid}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                console.log("Rendering option.image:", opt.image, "for: ", opt.name);
                const isDataUrl = typeof opt.image === 'string' && opt.image.startsWith('data:image');       

                if (activeTab === "Work-in-Progress") {
                  // WIP cards get special onClick logic
                  return (
                    <div
                      key={`${opt.name}-${idx}`}
                      className={styles.card}
                      onClick={() => onClickDraft(opt)}
                    >
                      {isDataUrl ? (
                        <img
                          src={opt.image}
                          alt={`Preview of ${opt.name}`}
                          className={styles.cardThumbnail}
                          width={64}
                          height={48}
                        />
                      ) : (
                        <Image
                          src={Icons[opt.image as keyof typeof Icons]}
                          alt={opt.name}
                          width={48}
                          height={48}
                        />
                      )}
                      <p className={styles.cardTitle}>{opt.name}</p>
                      <p className={styles.cardSubTitle}>Version {opt.version}</p>
                      {opt.updatedAt && (
                        <span className={styles.cardDate}>
                          Updated{" "}
                          {new Date(opt.updatedAt).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      )}
                    </div>
                  );
                }

                // Other tabs: simple push
                return (
                  <div
                    key={`${opt.name}-${idx}`}
                    className={styles.card}
                    onClick={() => router.push(opt.link)}
                  >
                    <Image
                      src={Icons[opt.image as keyof typeof Icons]}
                      alt={opt.name}
                      width={48}
                      height={48}
                    />
                    <p className={styles.cardTitle}>{opt.name}</p>
                    {opt.updatedAt && (
                      <span className={styles.cardDate}>
                        {opt.updatedAt}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.noResults}>
                No results found for “{searchTerm}”
              </div>
            )}
          </div>
          {/* ========== LOAD MORE for Work-in-Progress ========== */}
          {activeTab === "Work-in-Progress" && drafts && drafts.length === limit && (
            <div className={styles.loadMoreWrapper}>
              <button
                className={styles.btnLoadMore}
                onClick={() => setOffset((prev) => prev + limit)}
                disabled={!drafts || draftsError}
              >
                {draftsError ? "Error" : !drafts ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
          {/* ===== LOAD MORE (Recent Forms only) ===== */}
          {activeTab === "Recent Forms" && (
            <div className={styles.loadMoreWrapper}>
              <button className={styles.btnLoadMore}>Load More</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}