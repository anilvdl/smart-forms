// Form Designer Component Registry Interfaces
// All type definitions and contracts for the SmartForms Designer

export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE';
export type ComponentCategory = 'basic' | 'selection' | 'datetime' | 'file_media' | 'layout' | 'advanced' | 'composite' | 'payment';
export type ComponentGroup = 'input' | 'selection' | 'date' | 'layout' | 'media' | 'composite' | 'payment' | 'advanced';
export type RecipeCategory = 'collect_info' | 'make_choices' | 'schedule_time' | 'upload_files' | 'organize_form' | 'special_fields';

// Core component definition interface
export interface ComponentDefinition {
  id: string;
  type: string;
  category: ComponentCategory;
  group: ComponentGroup;
  label: string;
  description: string;
  icon: string;
  minPlan: PlanType;
  trialAllowed: false; // Always false as per requirements
  searchTags: string[];
  defaultProps: Record<string, any>;
  
  // Recipe card specific (added via lazy loading)
  recipeCard?: RecipeCardDefinition;
}

// Recipe card definition interface
export interface RecipeCardDefinition {
  friendlyName: string;
  friendlyDescription: string;
  category: RecipeCategory;
  preview: string;
  useCase: string;
  minPlan?: PlanType;
  trialAllowed?: false;
  defaultProps: Record<string, any>;
  personas?: {
    business?: { example: string };
    healthcare?: { example: string };
    educator?: { example: string };
    enterprise?: { example: string };
    casual?: { example: string };
  };
}

// Recipe category metadata interface
export interface RecipeCategoryInfo {
  id: RecipeCategory;
  label: string;
  icon: string;
  description: string;
}

// Component registry statistics interface
export interface ComponentStats {
  total: number;
  byPlan: Record<PlanType, number>;
  byCategory: Record<ComponentCategory, number>;
  byGroup: Record<ComponentGroup, number>;
}

// Recipe card statistics interface
export interface RecipeCardStats {
  total: number;
  withRecipeCards: number;
  withoutRecipeCards: number;
  paymentPlaceholders: number;
  missingRecipeCards: string[];
  isComplete: boolean;
  byCategory: Record<RecipeCategory, number>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

// Registry validation result interface
export interface RegistryValidation {
  isValid: boolean;
  errors: string[];
}

// Component registry metadata interface
export interface RegistryMetadata {
  version: string;
  totalComponents: number;
  lastUpdated: string;
  categories: string[];
  groups: string[];
  planTypes: PlanType[];
  recipeCategories: string[];
  phase: string;
  nextPhase: string;
  notes: string[];
}

// Recipe card loading state interface
export interface RecipeCardLoadState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  cachedAt: Date | null;
}

// Component search options interface
export interface ComponentSearchOptions {
  query: string;
  category?: ComponentCategory;
  recipeCategory?: RecipeCategory;
  planFilter?: PlanType;
  includeRestricted?: boolean;
}

// Lazy loading cache interface
export interface ComponentCache {
  recipeCards: Record<string, RecipeCardDefinition>;
  loadState: RecipeCardLoadState;
  clearCache: () => void;
  invalidateCache: () => void;
}

// Export utility types
export type ComponentRegistry = ComponentDefinition[];
export type ComponentsByCategory = Record<ComponentCategory, ComponentDefinition[]>;
export type ComponentsByRecipeCategory = Record<string, ComponentDefinition[]>;