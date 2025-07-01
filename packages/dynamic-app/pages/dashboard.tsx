import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import Navbar from "@smartforms/shared/components/ui/Navbar";
import Footer from "@smartforms/shared/components/ui/Footer";
import { Icons } from "@smartforms/shared/icons";
import useSWR, { mutate } from "swr";
import styles from "styles/dashboard.module.css";
import { TemplateOption } from "types/types";
import { ToastContainer, toast } from 'react-toastify';
import TemplateSelectionModal from 'components/templates/TemplateSelectionModal';
import FavoriteTemplatesModal from 'components/templates/FavoriteTemplatesModal';
import { Loader } from 'lucide-react';
import MyFormsTab from "components/templates/MyFormsTab";

type Tab =
  | "Start a New Form"
  | "Quick Actions"
  | "Work-in-Progress"
  | "My Forms"
  | "Recent Forms";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const { query, replace } = useRouter();
  const router = useRouter();
  const [isProcessingOnboarding, setIsProcessingOnboarding] = useState(false);
  
  // STATE: Template modal and form creation
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isTransitioningModals, setIsTransitioningModals] = useState(false);

  // PAGINATION STATE for WIP
  const [limit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);

  const tabs: Tab[] = [
    "Start a New Form",
    "Quick Actions",
    "Work-in-Progress",
    "My Forms",
    "Recent Forms",
  ];
  const [activeTab, setActiveTab] = useState<Tab>("Start a New Form");

  // Search box state
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Start options now open template modal
  const startOptions: TemplateOption[] = [
    { name: "RSVP", image: "rsvp", link: "#template-modal" },
    { name: "Party Invite", image: "party-invite", link: "#template-modal" },
    { name: "Event Registration", image: "event-registration", link: "#template-modal" },
    { name: "Survey", image: "blank-form", link: "#template-modal" },
  ];
  
  // Updated Quick Actions to open favorites modal
  const quickOptions: TemplateOption[] = [
    { name: "Favorite Templates", image: "favorite", link: "#favorites-modal" },
    { name: "Recommended", image: "recommended", link: "#" },
  ];
  
  // Stub "Recent Forms" (we'll eventually fetch real data here)
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
  const { data: drafts, error: draftsError } = useSWR<TemplateOption[]>
      (activeTab === "Work-in-Progress" ? "/api/forms/designer/drafts" : null, fetcher);

  // Build "currentOptions" depending on activeTab, before filtering
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
      
      case "My Forms" :
        return [];

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

  const onboardingComplete = query.onBoardingComplete;

  useEffect(() => {
    if (query.error === "unauthorized") {
      toast.error("You're not authorized to view the requested page.");
      // clear the param so the toast only shows once
      replace("/dashboard", undefined, { shallow: true });
    }
  }, [query.error, replace]);

  // Handle onboarding completion
  useEffect(() => {
    async function handleOnboardingComplete() {
      if (query.onBoardingComplete === 'true' && session?.user?.needsOnboarding && !isProcessingOnboarding) {
        setIsProcessingOnboarding(true);
        
        // Update the session properly
        await update({
          needsOnboarding: false,
          onboardingComplete: true
        });
        
        // Show success message
        toast.success("Onboarding complete! You can now start using SmartForms.");
        // Clean up URL
        replace("/dashboard", undefined, { shallow: true });
        setIsProcessingOnboarding(false);
      }
    }
    
    handleOnboardingComplete();
  }, [query.onBoardingComplete, session?.user?.needsOnboarding, update, replace, isProcessingOnboarding]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (session?.user) {
      // Check if user needs email verification (only for credential users)
      if (session.user.needsEmailVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`);
        return;
      }
      
      // Check if user needs onboarding
      if (session.user.needsOnboarding && !onboardingComplete) {
        router.push('/onboarding');
        return;
      }
    }
  }, [status, session, router, query.onboardingComplete]);

  // Reset search when tab changes
  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  // Handle template selection
  const handleTemplateSelect = async (templateId: string) => {
    console.log('[dashboard] -> [handleTemplateSelect] -> Selected template ID:', templateId);
    setIsCreatingForm(true);
    try {
      const response = await fetch('/api/templates/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      });

      if (response.ok) {
        const { formId } = await response.json();
        toast.success('Template loaded successfully!');
        
        // Set origin for form builder
        if (typeof window !== "undefined") {
          sessionStorage.setItem("lastOrigin", "template");
        }
        
        router.push(`/form-builder?formId=${formId}&version=1`);
      } else {
        throw new Error('Failed to clone template');
      }
    } catch (error) {
      console.error('Error selecting template:', error);
      toast.error('Failed to load template');
    } finally {
      setIsCreatingForm(false);
    }
  };

  // Handle multiple templates added to favorites
  const handleMultipleFavorites = (templateIds: string[]) => {
    console.log('[dashboard] -> [handleMultipleFavorites] -> Selected template IDs:', templateIds);
    toast.success(`Added ${templateIds.length} templates to your favorites!`);
    // If on Quick Actions tab, you might want to refresh favorites
    if (activeTab === "Quick Actions") {
      // Could trigger a refresh of favorites here if needed
    }
  };

  // Handle click on "Blank Form" to create empty form
  async function onClickNewForm() {
    setIsCreatingForm(true);
    router.replace("/form-builder");
  }

  // Loading state
  if (status === 'loading' || isProcessingOnboarding) {
    return <div>Loading...</div>;
  }

  // Redirecting states
  if (session?.user?.needsEmailVerification) {
    return <div>Redirecting to email verification...</div>;
  }

  if (session?.user?.needsOnboarding && query.onBoardingComplete !== 'true') {
    return redirectSpinner();
  }
  
  // Handle click on a WIP‐card: seed SWR cache, set "lastOrigin", and replace URL
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

      // Mark "came from WIP"
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

  // Handle click on template cards in Start a New Form
  function handleTemplateCardClick(opt: TemplateOption) {
    if (opt.link === "#template-modal") {
      setIsTemplateModalOpen(true);
    } else {
      router.push(opt.link);
    }
  }

  // Handle click on Quick Actions cards
  function handleQuickActionClick(opt: TemplateOption) {
    if (opt.link === "#favorites-modal") {
      setIsFavoritesModalOpen(true);
    } else if (opt.name === "Recommended") {
      toast.info("🚀 AI-powered recommendations coming soon! Stay tuned for smart template suggestions based on your usage patterns.");
    } else {
      router.push(opt.link);
    }
  }

  // Handle opening template modal from favorites
  const handleOpenTemplateModal = () => {
    setIsTransitioningModals(true);
    
    // Show a transition toast
    toast.info("Loading template gallery...", {
      autoClose: 1000,
      hideProgressBar: false,
    });
    
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsTemplateModalOpen(true);
      setIsTransitioningModals(false);
    }, 300);
  };

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
                    disabled={isCreatingForm}
                  >
                    {isCreatingForm ? (
                      <>
                        <Loader className="inline-spinner" size={16} />
                        Creating...
                      </>
                    ) : (
                      'Blank Form →'
                    )}
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
                    onClick={() => setIsFavoritesModalOpen(true)}
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
            {activeTab === "My Forms" && (
              <>
                <div className={styles.heroIcon}>📂</div>
                <div className={styles.heroContent}>
                  <h3>Your Published Forms</h3>
                  <p>Manage, share, and track all your published forms in one place.</p>
                </div>
              </>
            )}
            {activeTab === "Recent Forms" && (
              <>
                <div className={styles.heroIcon}>🕑</div>
                <div className={styles.heroContent}>
                  <h3>Your Recent Forms</h3>
                  <p>See the forms you've opened most recently.</p>
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

          {/* For My Forms tab, render the dedicated component */}
          {activeTab === "My Forms" ? (
            <MyFormsTab isActive={true} />
          ) : (
            <>
              {/* ===== CARD GRID (FILTERED) ===== */}
              <div className={styles.cardGrid}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
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

                // Start a New Form cards open template modal
                if (activeTab === "Start a New Form") {
                  return (
                    <div
                      key={`${opt.name}-${idx}`}
                      className={styles.card}
                      onClick={() => handleTemplateCardClick(opt)}
                    >
                      <Image
                        src={Icons[opt.image as keyof typeof Icons]}
                        alt={opt.name}
                        width={48}
                        height={48}
                      />
                      <p className={styles.cardTitle}>{opt.name}</p>
                    </div>
                  );
                }

                // Quick Actions cards - handle favorites modal
                if (activeTab === "Quick Actions") {
                  return (
                    <div
                      key={`${opt.name}-${idx}`}
                      className={styles.card}
                      onClick={() => handleQuickActionClick(opt)}
                    >
                      <Image
                        src={Icons[opt.image as keyof typeof Icons]}
                        alt={opt.name}
                        width={48}
                        height={48}
                      />
                      <p className={styles.cardTitle}>{opt.name}</p>
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
                No results found for "{searchTerm}"
              </div>
            )}
                        </div>

              {/* View All Templates button for Start a New Form tab */}
              {activeTab === "Start a New Form" && (
                <div className={styles.loadMoreWrapper}>
                  <button 
                    className={styles.btnLoadMore}
                    onClick={() => setIsTemplateModalOpen(true)}
                  >
                    View All Templates →
                  </button>
                </div>
              )}

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
            </>
          )}
        </div>
      </main> 
      <Footer />
      
      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        onSelectMultipleFavorites={handleMultipleFavorites}
      />
      
      {/* Favorite Templates Modal */}
      <FavoriteTemplatesModal
        isOpen={isFavoritesModalOpen && !isTransitioningModals}
        onClose={() => setIsFavoritesModalOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        onOpenTemplateModal={handleOpenTemplateModal}
      />
      
      <ToastContainer
        theme="light"
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        toastStyle={{
          minWidth: '550px',
          maxWidth: '600px',
          padding: '16px',
          fontSize: '15px',
        }}
      />
    </div>
  );
}

function redirectSpinner() {
  return <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    flexDirection: "column"
  }}>
    <div style={{ textAlign: "center" }}>
      <div className="spinner"></div>
      <h2 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>
        Loading your account...
      </h2>
      <p style={{ color: "#666", margin: 0 }}>
        Please wait while we retrieve your information.
      </p>
    </div>

    <style jsx>{`
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #ff6600;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }

          .inline-spinner {
            display: inline-block;
            animation: spin 1s linear infinite;
            margin-right: 8px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
  </div>;
}