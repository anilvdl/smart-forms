// Main Component Registry - Index with Lazy Loading
// Combines traditional components with lazy-loaded recipe cards
import { 
  ComponentDefinition, 
  ComponentRegistry,
  ComponentsByCategory,
  ComponentsByRecipeCategory,
  ComponentCategory,
  RecipeCategory,
  RecipeCategoryInfo,
  ComponentCache,
  RecipeCardLoadState,
  ComponentStats,
  RecipeCardStats,
  RegistryMetadata
} from './interfaces';

import { 
  traditionalComponentRegistry,
  getComponentsByCategory as getTraditionalComponentsByCategory,
  getComponentsByGroup,
  searchComponents as searchTraditionalComponents,
  getComponentById as getTraditionalComponentById,
  getComponentByType as getTraditionalComponentByType,
  validateComponentRegistry,
  getComponentStats as getTraditionalComponentStats,
  getTraditionalRegistryMetadata
} from './traditionalComponents';

// ===================================
// LAZY LOADING CACHE MANAGEMENT
// ===================================
class RecipeCardCache implements ComponentCache {
  private _recipeCards: Record<string, any> = {};
  private _loadState: RecipeCardLoadState = {
    isLoaded: false,
    isLoading: false,
    error: null,
    cachedAt: null
  };
  private _enhancedRegistry: ComponentDefinition[] | null = null;

  get recipeCards() {
    return this._recipeCards;
  }

  get loadState() {
    return { ...this._loadState };
  }

  get enhancedRegistry() {
    return this._enhancedRegistry;
  }

  setLoadState(state: Partial<RecipeCardLoadState>) {
    this._loadState = { ...this._loadState, ...state };
  }

  setRecipeCards(cards: Record<string, any>) {
    this._recipeCards = cards;
    this._enhancedRegistry = null; // Clear cached enhanced registry
  }

  setEnhancedRegistry(registry: ComponentDefinition[]) {
    this._enhancedRegistry = registry;
  }

  clearCache() {
    this._recipeCards = {};
    this._enhancedRegistry = null;
    this._loadState = {
      isLoaded: false,
      isLoading: false,
      error: null,
      cachedAt: null
    };
  }

  invalidateCache() {
    this.clearCache();
  }
}

// Global cache instance
const recipeCardCache = new RecipeCardCache();

// ===================================
// LAZY LOADING FUNCTIONS
// ===================================

// Dynamic import function for recipe cards
const loadRecipeCardDefinitions = async (): Promise<{
  success: boolean;
  registry: ComponentDefinition[];
  error?: string;
  recipeCardDefinitions?: Record<string, any>;
  utilities?: any;
}> => {
  try {
    recipeCardCache.setLoadState({ isLoading: true, error: null });
    
    // Dynamic import of recipe card definitions
    const recipeCardModule = await import('./recipeCardDefinitions');
    const { 
      recipeCardDefinitions, 
      addRecipeCardsToRegistry,
      getComponentsByRecipeCategory,
      getRecipeCategories,
      validateRecipeCards,
      getRecipeCardStats
    } = recipeCardModule;
    
    // Cache the loaded data
    recipeCardCache.setRecipeCards(recipeCardDefinitions);
    
    // Create enhanced registry with recipe cards
    const enhancedRegistry = addRecipeCardsToRegistry(traditionalComponentRegistry);
    recipeCardCache.setEnhancedRegistry(enhancedRegistry);
    
    recipeCardCache.setLoadState({
      isLoaded: true,
      isLoading: false,
      error: null,
      cachedAt: new Date()
    });
    
    return {
      success: true,
      registry: enhancedRegistry,
      recipeCardDefinitions,
      utilities: {
        getComponentsByRecipeCategory,
        getRecipeCategories,
        validateRecipeCards,
        getRecipeCardStats
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load recipe cards';
    recipeCardCache.setLoadState({
      isLoading: false,
      error: errorMessage
    });
    
    return {
      success: false,
      error: errorMessage,
      registry: traditionalComponentRegistry // Fallback to traditional
    };
  }
};

// ===================================
// PUBLIC API FUNCTIONS
// ===================================

// Get component registry (with or without recipe cards)
export const getComponentRegistry = async (forceRecipeCards = false): Promise<ComponentDefinition[]> => {
  // If recipe cards are not loaded and not requested, return traditional registry
  if (!forceRecipeCards && !recipeCardCache.loadState.isLoaded) {
    return traditionalComponentRegistry;
  }
  
  // If recipe cards are already loaded, return cached enhanced registry
  if (recipeCardCache.loadState.isLoaded && recipeCardCache.enhancedRegistry) {
    return recipeCardCache.enhancedRegistry;
  }
  
  // If currently loading, wait for completion
  if (recipeCardCache.loadState.isLoading) {
    // Implement a simple polling mechanism (in a real app, you'd use proper async handling)
    while (recipeCardCache.loadState.isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return recipeCardCache.enhancedRegistry || traditionalComponentRegistry;
  }
  
  // Load recipe cards
  const result = await loadRecipeCardDefinitions();
  return result.registry;
};

// Load recipe cards explicitly (for lazy loading)
export const loadRecipeCards = async (): Promise<{
  success: boolean;
  registry: ComponentDefinition[];
  fromCache: boolean;
  error?: string;
}> => {
  // Return cached data if already loaded
  if (recipeCardCache.loadState.isLoaded && recipeCardCache.enhancedRegistry) {
    return {
      success: true,
      registry: recipeCardCache.enhancedRegistry,
      fromCache: true
    };
  }
  
  // Load fresh data
  const result = await loadRecipeCardDefinitions();
  return {
    success: result.success,
    registry: result.registry,
    fromCache: false,
    error: result.error
  };
};

// Check if recipe cards are loaded
export const areRecipeCardsLoaded = (): boolean => {
  return recipeCardCache.loadState.isLoaded;
};

// Get recipe card load state
export const getRecipeCardLoadState = (): RecipeCardLoadState => {
  return recipeCardCache.loadState;
};

// ===================================
// COMPONENT ACCESS FUNCTIONS
// ===================================

// Synchronous access to traditional registry (always available)
export const componentRegistry = traditionalComponentRegistry;

// Get components by category
export const getComponentsByCategory = (category: ComponentCategory): ComponentDefinition[] => {
  // Use enhanced registry if available, otherwise traditional
  const registry = recipeCardCache.enhancedRegistry || traditionalComponentRegistry;
  return registry.filter(comp => comp.category === category);
};

// Get components by recipe category (only works if recipe cards are loaded)
export const getComponentsByRecipeCategory = async (category: RecipeCategory): Promise<ComponentDefinition[]> => {
  const registry = await getComponentRegistry(true); // Force load recipe cards
  return registry.filter(comp => comp.recipeCard?.category === category);
};

// Search components
export const searchComponents = (query: string): ComponentDefinition[] => {
  const registry = recipeCardCache.enhancedRegistry || traditionalComponentRegistry;
  const lowercaseQuery = query.toLowerCase();
  
  return registry.filter(comp => 
    comp.label.toLowerCase().includes(lowercaseQuery) ||
    comp.description.toLowerCase().includes(lowercaseQuery) ||
    comp.searchTags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    (comp.recipeCard?.friendlyName.toLowerCase().includes(lowercaseQuery)) ||
    (comp.recipeCard?.friendlyDescription.toLowerCase().includes(lowercaseQuery))
  );
};

// Get component by ID
export const getComponentById = (id: string): ComponentDefinition | undefined => {
  const registry = recipeCardCache.enhancedRegistry || traditionalComponentRegistry;
  return registry.find(comp => comp.id === id);
};

// Get component by type
export const getComponentByType = (type: string): ComponentDefinition | undefined => {
  const registry = recipeCardCache.enhancedRegistry || traditionalComponentRegistry;
  return registry.find(comp => comp.type === type);
};

// ===================================
// RECIPE CARD SPECIFIC FUNCTIONS
// ===================================

// Get recipe categories (async to ensure recipe cards are loaded)
export const getRecipeCategories = async (): Promise<RecipeCategoryInfo[]> => {
  if (!recipeCardCache.loadState.isLoaded) {
    await loadRecipeCardDefinitions();
  }
  
  // Default categories if loading failed
  return [
    { id: 'collect_info', label: 'Collect Information', icon: 'user', description: 'Gather details like names, emails, and contact info' },
    { id: 'make_choices', label: 'Let Them Choose', icon: 'checkbox', description: 'Multiple choice, ratings, and selection fields' },
    { id: 'schedule_time', label: 'Schedule Time', icon: 'calendar', description: 'Date pickers, time slots, and appointment booking' },
    { id: 'upload_files', label: 'Upload Files', icon: 'upload', description: 'Documents, images, and file attachments' },
    { id: 'organize_form', label: 'Organize Your Form', icon: 'layers', description: 'Sections, dividers, and layout elements' },
    { id: 'special_fields', label: 'Special Fields', icon: 'star', description: 'Advanced features like signatures and locations' }
  ];
};

// ===================================
// STATISTICS AND METADATA
// ===================================

// Get component statistics
export const getComponentStats = (): ComponentStats => {
  return getTraditionalComponentStats();
};

// Get recipe card statistics (only if loaded)
export const getRecipeCardStats = async (): Promise<RecipeCardStats | null> => {
  if (!recipeCardCache.loadState.isLoaded) {
    return null;
  }
  
  const registry = recipeCardCache.enhancedRegistry || traditionalComponentRegistry;
  
  // Import validation function if recipe cards are loaded
  try {
    const { validateRecipeCards } = await import('./recipeCardDefinitions');
    return validateRecipeCards(registry);
  } catch {
    return null;
  }
};

// Get registry metadata
export const getRegistryMetadata = (): RegistryMetadata => {
  const traditional = getTraditionalRegistryMetadata();
  
  if (recipeCardCache.loadState.isLoaded) {
    return {
      ...traditional,
      phase: 'Phase 2 - Recipe Cards Loaded',
      nextPhase: 'Phase 3 - Enhanced UI Features',
      notes: [
        ...traditional.notes,
        'Recipe cards successfully loaded and cached',
        `Cached at: ${recipeCardCache.loadState.cachedAt?.toISOString()}`
      ]
    };
  }
  
  return traditional;
};

// ===================================
// CACHE MANAGEMENT FUNCTIONS
// ===================================

// Clear recipe card cache (call on logout)
export const clearRecipeCardCache = (): void => {
  recipeCardCache.clearCache();
};

// Force reload recipe cards
export const reloadRecipeCards = async () => {
  recipeCardCache.clearCache();
  return await loadRecipeCardDefinitions();
};

// Get cache information for debugging
export const getCacheInfo = () => {
  return {
    loadState: recipeCardCache.loadState,
    hasEnhancedRegistry: !!recipeCardCache.enhancedRegistry,
    registrySize: recipeCardCache.enhancedRegistry?.length || 0,
    traditionalSize: traditionalComponentRegistry.length
  };
};

// ===================================
// EXPORTS FOR BACKWARD COMPATIBILITY
// ===================================

// Re-export traditional functions for components that don't need recipe cards
export { 
  getComponentsByGroup,
  validateComponentRegistry
} from './traditionalComponents';

// Re-export all types
export * from './interfaces';