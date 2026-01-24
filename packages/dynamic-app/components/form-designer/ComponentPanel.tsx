import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { 
  componentRegistry, 
  getComponentsByCategory, 
  searchComponents,
  ComponentCategory,
  getRecipeCategories,
  getComponentsByRecipeCategory,
  loadRecipeCards,
  areRecipeCardsLoaded,
  getRecipeCardLoadState,
  clearRecipeCardCache
} from '@smartforms/dynamic-app/services/form-designer/componentRegistry';
import { getIcon, categoryIcons, recipeCategoryIcons } from '@smartforms/dynamic-app/services/form-designer/iconMapping';
import { TraditionalComponentList } from './panels/TraditionalComponentList';
import { RecipeCardComponentList } from './panels/RecipeCardComponentList';
import { X, Search, List, Sparkles, Package, Loader2, AlertCircle } from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/component-panel.module.css';

export const ComponentPanel: React.FC = () => {
  const { 
    user, 
    isComponentPanelOpen,
    toggleComponentPanel, 
    updateUiMode,
    canAccessComponent 
  } = useFormBuilder();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic']));
  const [recipeCardsLoaded, setRecipeCardsLoaded] = useState(areRecipeCardsLoaded());
  const [recipeLoadError, setRecipeLoadError] = useState<string | null>(null);
  const [enhancedRegistry, setEnhancedRegistry] = useState(componentRegistry);
  
  const isRecipeMode = user?.uiMode === 'recipe';
  const recipeLoadState = getRecipeCardLoadState();
  
  // Handle recipe card loading when switching to recipe mode
  const handleRecipeCardLoading = useCallback(async () => {
    if (isRecipeMode && !recipeCardsLoaded && !recipeLoadState.isLoading) {
      try {
        setRecipeLoadError(null);
        const result = await loadRecipeCards();
        
        if (result.success) {
          setRecipeCardsLoaded(true);
          setEnhancedRegistry(result.registry);
        } else {
          // Handle individual card failures gracefully
          const errorMessage = 'error' in result ? result.error : 'Failed to load recipe cards';
          if (errorMessage && errorMessage.includes('individual')) {
            setRecipeCardsLoaded(true);
            setEnhancedRegistry(result.registry);
            // Silent fallback for individual failures
          } else {
            // Complete system failure - fallback to traditional mode
            setRecipeLoadError(errorMessage || 'Failed to load recipe cards');
            updateUiMode('traditional');
          }
        }
      } catch (error) {
        setRecipeLoadError('Failed to load recipe cards');
        updateUiMode('traditional');
      }
    }
  }, [isRecipeMode, recipeCardsLoaded, recipeLoadState.isLoading, updateUiMode]);
  
  // Effect to handle mode changes and recipe card loading
  useEffect(() => {
    handleRecipeCardLoading();
  }, [handleRecipeCardLoading]);
  
  // Effect to handle user logout (clear cache)
  useEffect(() => {
    if (!user) {
      clearRecipeCardCache();
      setRecipeCardsLoaded(false);
      setEnhancedRegistry(componentRegistry);
      setRecipeLoadError(null);
    }
  }, [user]);
  
  // Filter components based on search
  const filteredComponents = useMemo(() => {
    if (!searchQuery) { 
        console.log('>>>> no search enhancedRegistry: ', enhancedRegistry);
        return enhancedRegistry;
    }
    return searchComponents(searchQuery);
  }, [searchQuery, enhancedRegistry]);
  
  // Group components by traditional category
  const componentsByCategory = useMemo(() => {
    const grouped: Record<ComponentCategory, typeof componentRegistry> = {
      basic: [], 
      selection: [],
      datetime: [],
      file_media: [],
      layout: [],
      advanced: [],
      composite: [],
      payment: []
    };
    
    filteredComponents.forEach(comp => {
      grouped[comp.category].push(comp);
    });
    console.log('grouped: ', grouped);
    return grouped;
  }, [filteredComponents]);
  
  // Group components by recipe category (async loaded)
  const [componentsByRecipeCategory, setComponentsByRecipeCategory] = useState<Record<string, typeof componentRegistry>>({});
  
  useEffect(() => {
    const loadRecipeCategories = async () => {
      if (isRecipeMode && recipeCardsLoaded) {
        try {
          const recipeCategories = await getRecipeCategories();
          const grouped: Record<string, typeof componentRegistry> = {};
          
          // Use Promise.all to load all categories
          const categoryPromises = recipeCategories.map(async (cat) => {
            const components = await getComponentsByRecipeCategory(cat.id);
            return { categoryId: cat.id, components };
          });
          
          const results = await Promise.all(categoryPromises);
          results.forEach(({ categoryId, components }) => {
            grouped[categoryId] = components;
          });
          
          // Filter by search if needed
          if (searchQuery) {
            Object.keys(grouped).forEach(key => {
              grouped[key] = grouped[key].filter(comp => 
                filteredComponents.some(fc => fc.id === comp.id)
              );
            });
          }
          
          setComponentsByRecipeCategory(grouped);
        } catch (error) {
          console.error('Failed to load recipe categories:', error);
        }
      }
    };
    
    loadRecipeCategories();
  }, [isRecipeMode, recipeCardsLoaded, filteredComponents, searchQuery]);
  
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };
  
  const handleUiModeToggle = (mode: 'traditional' | 'recipe') => {
    updateUiMode(mode);
  };
  
  // Render loading state for recipe cards
  const renderRecipeLoadingState = () => (
    <div className={styles.loadingState}>
      <div className={styles.loadingSpinner}>
        <Loader2 size={32} className={styles.spinner} />
      </div>
      <div className={styles.loadingText}>
        <h4>Loading recipe cards...</h4>
        <p>Getting your friendly form components ready</p>
      </div>
    </div>
  );
  
  // Render error state with fallback option
  const renderRecipeErrorState = () => (
    <div className={styles.errorState}>
      <div className={styles.errorIcon}>
        <AlertCircle size={32} />
      </div>
      <div className={styles.errorText}>
        <h4>Unable to load recipe cards</h4>
        <p>Switched to traditional view</p>
      </div>
      <button 
        className={styles.retryButton}
        onClick={() => {
          setRecipeLoadError(null);
          handleRecipeCardLoading();
        }}
      >
        Try Again
      </button>
    </div>
  );
  
  return (
    <>
      {/* Slide-out Tab Indicator (shown when panel is closed) - NO COUNT */}
      {!isComponentPanelOpen && (
        <div className={styles.slideOutTab} onClick={toggleComponentPanel}>
          <div className={styles.tabIcon}>
            <Package size={16} />
          </div>
          <div className={styles.tabContent}>
            <span className={styles.tabLabel}>Components</span>
          </div>
        </div>
      )}
      
      {/* Main Component Panel */}
      <div className={`${styles.componentPanel} ${isComponentPanelOpen ? styles.open : styles.closed}`}>
        {/* Fixed Header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerTop}>
            <h3 className={styles.panelTitle}>
              {isRecipeMode ? 'Add to your form' : 'Form Elements'}
            </h3>
            <button 
              className={styles.closeButton}
              onClick={toggleComponentPanel}
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* UI Mode Toggle */}
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeToggleButton} ${!isRecipeMode ? styles.active : ''}`}
              onClick={() => handleUiModeToggle('traditional')}
              title="List view"
            >
              <List size={12} />
              <span>List</span>
            </button>
            <button
              className={`${styles.modeToggleButton} ${isRecipeMode ? styles.active : ''}`}
              onClick={() => handleUiModeToggle('recipe')}
              title="Card view"
              disabled={recipeLoadState.isLoading}
            >
              <Sparkles size={12} />
              <span>Cards</span>
              {recipeLoadState.isLoading && <Loader2 size={10} className={styles.buttonSpinner} />}
            </button>
          </div>
        </div>
        
        {/* Fixed Search Container */}
        <div className={styles.searchContainer}>
          {isRecipeMode && (
            <p className={styles.searchLabel}>What do you want to add?</p>
          )}
          {/* <div className={styles.searchInputWrapper}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={isRecipeMode ? "Search..." : "Search components..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div> */}
          <div className={styles.searchInputWrapper}>
            <Search size={14} className={styles.searchIcon} />
            <input
                type="text"
                placeholder={isRecipeMode ? "Search..." : "Search components..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
            />
            {searchQuery && (
                <button
                onClick={() => setSearchQuery('')}
                className={styles.searchClear}
                title="Clear search"
                >
                <X size={14} />
                </button>
            )}
            </div>
        </div>
        
        {/* Single Scrollable Component List Area */}
        <div className={styles.componentList}>
          {isRecipeMode ? (
            <>
              {recipeLoadState.isLoading ? (
                renderRecipeLoadingState()
              ) : recipeLoadError ? (
                renderRecipeErrorState()
              ) : (
                <RecipeCardComponentList
                  componentsByCategory={componentsByRecipeCategory}
                  searchQuery={searchQuery}
                />
              )}
            </>
          ) : (
            <TraditionalComponentList
              componentsByCategory={componentsByCategory}
              expandedCategories={expandedCategories}
              onToggleCategory={toggleCategory}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </>
  );
};