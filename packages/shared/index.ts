// Core “app” entry (if you ever need to render a shared <App />)
export { default as App } from "./app/App";

// Shared UI components
export { default as NavBar }            from "./components/ui/Navbar";
export { default as Footer }            from "./components/ui/Footer";
export { default as Clients }           from "./components/ui/Clients";
export { default as FeatureCarousel }   from "./components/ui/FeatureCarousel";
export { default as WelcomeContent }    from "./components/ui/WelcomeContent";
export { default as PlanCard }          from "./components/ui/PlanCard";
export { default as SfAnimatedLogo }    from "./components/ui/Logo";

// Shared navigation data/types
export type { MenuItem, SubMenu }       from "./components/ui/navigation";
export { publicMenu, privateMenu }      from "./components/ui/navigation";

// Icons lookup
export { Icons }                         from "./icons";

// Config & static data
// export { default as appConfig }          from "./config/appConfig";
export { default as countryCodes }       from "./data/countryCodes";

// Hooks
// export { default as useAuth }            from "./hooks/useAuth";
// export { default as useStorage }         from "./hooks/useStorage";

// Modals
export { default as TermsModal }         from "./modals/TermsModal";

// Utility functions
// export * from "./utils/helpers";
export * from "./utils/navigationUtil";