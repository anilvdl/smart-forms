import React, { useState, useMemo, useEffect } from 'react';
import { useFormBuilder } from '@smartforms/dynamic-app/services/form-designer/formBuilderContext';
import { ComponentDefinition, RecipeCategoryInfo } from '@smartforms/dynamic-app/services/form-designer/componentRegistry';
import { getIcon, recipeCategoryIcons } from '@smartforms/dynamic-app/services/form-designer/iconMapping';
import { Lock, Plus, ChevronDown, ChevronRight, Info, Star, Zap, Eye, HelpCircle } from 'lucide-react';
import { UpgradeModal } from '../UpgradeModal';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/recipe-card-list.module.css';
import { PreviewTooltip } from './PreviewTooltip';

interface EnhancedRecipeCardProps {
  componentsByCategory: Record<string, ComponentDefinition[]>;
  searchQuery: string;
}

interface PersonaRecommendation {
  componentId: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export const RecipeCardComponentList: React.FC<EnhancedRecipeCardProps> = ({
  componentsByCategory,
  searchQuery
}) => {
  const { 
    user,
    addElement, 
    setDraggedComponent, 
    canAccessComponent,
    trackComponentUsage 
  } = useFormBuilder();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentDefinition | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['collect_info', 'make_choices']) // Start with most common categories expanded
  );
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showProgressiveDetails, setShowProgressiveDetails] = useState<string | null>(null);
  const [recipeCategories, setRecipeCategories] = useState<RecipeCategoryInfo[]>([]);

  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState<'right' | 'bottom'>('right');

  const userPersona = user?.persona || 'business';

  // Load recipe categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { getRecipeCategories } = await import('@smartforms/dynamic-app/services/form-designer/componentRegistry');
        const categories = await getRecipeCategories();
        setRecipeCategories(categories);
      } catch (error) {
        console.error('Failed to load recipe categories:', error);
        // Fallback categories
        setRecipeCategories([
          { id: 'collect_info', label: 'Collect Information', icon: 'user', description: 'Gather details like names, emails, and contact info' },
          { id: 'make_choices', label: 'Let Them Choose', icon: 'checkbox', description: 'Multiple choice, ratings, and selection fields' },
          { id: 'schedule_time', label: 'Schedule Time', icon: 'calendar', description: 'Date pickers, time slots, and appointment booking' },
          { id: 'upload_files', label: 'Upload Files', icon: 'upload', description: 'Documents, images, and file attachments' },
          { id: 'organize_form', label: 'Organize Your Form', icon: 'layers', description: 'Sections, dividers, and layout elements' },
          { id: 'special_fields', label: 'Special Fields', icon: 'star', description: 'Advanced features like signatures and locations' }
        ]);
      }
    };

    loadCategories();
  }, []);

  // Persona-specific component recommendations
  const getPersonaRecommendations = (): PersonaRecommendation[] => {
    const recommendations: PersonaRecommendation[] = [];
    
    // Business persona recommendations
    if (userPersona === 'business') {
      recommendations.push(
        { componentId: 'email-input', reason: 'Essential for customer contact', priority: 'high' },
        { componentId: 'text-input', reason: 'Collect customer names', priority: 'high' },
        { componentId: 'phone-input', reason: 'Customer support contact', priority: 'medium' },
        { componentId: 'dropdown-select', reason: 'Service categories', priority: 'medium' }
      );
    }
    
    // Healthcare persona recommendations
    if (userPersona === 'healthcare') {
      recommendations.push(
        { componentId: 'text-input', reason: 'Patient information', priority: 'high' },
        { componentId: 'email-input', reason: 'Contact and reminders', priority: 'high' },
        { componentId: 'date-picker', reason: 'Appointment scheduling', priority: 'high' },
        { componentId: 'textarea', reason: 'Medical history', priority: 'medium' }
      );
    }
    
    // Add more persona-specific recommendations...
    
    return recommendations;
  };

  const personaRecommendations = useMemo(() => getPersonaRecommendations(), [userPersona]);
  
  const isRecommended = (componentId: string): PersonaRecommendation | null => {
    return personaRecommendations.find(rec => rec.componentId === componentId) || null;
  };

  const getPersonaExample = (component: ComponentDefinition): string => {
    if (!component.recipeCard?.personas) return component.recipeCard?.useCase || '';
    
    const personaExample = component.recipeCard.personas[userPersona as keyof typeof component.recipeCard.personas];
    return personaExample?.example || component.recipeCard.useCase;
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleComponentClick = (component: ComponentDefinition) => {
    const hasAccess = canAccessComponent(component);
    
    if (hasAccess) {
      addElement(component.type);
      
      // Track usage for analytics
      if (trackComponentUsage) {
        trackComponentUsage(component.id, 'added');
      }
    } else {
      setSelectedComponent(component);
      setShowUpgradeModal(true);
    }
  };

  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    if (canAccessComponent(component)) {
      setDraggedComponent(component);
      e.dataTransfer.effectAllowed = 'copy';
    } else {
      e.preventDefault();
    }
  };

  const handleDragEnd = () => {
    setDraggedComponent(null);
  };

  const renderProgressiveDetails = (component: ComponentDefinition) => {
    if (showProgressiveDetails !== component.id) return null;
    
    return (
      <div className={styles.progressiveDetails}>
        <div className={styles.detailsContent}>
          <div className={styles.detailSection}>
            <h5>How it works:</h5>
            <p>{component.description}</p>
          </div>
          
          {component.recipeCard?.personas && (
            <div className={styles.detailSection}>
              <h5>Examples by role:</h5>
              <div className={styles.personaExamples}>
                {Object.entries(component.recipeCard.personas).map(([persona, data]) => (
                  <div key={persona} className={styles.personaExample}>
                    <strong>{persona}:</strong> {data.example}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className={styles.detailSection}>
            <h5>Default settings:</h5>
            <div className={styles.defaultProps}>
              {Object.entries(component.defaultProps).slice(0, 3).map(([key, value]) => (
                <div key={key} className={styles.propItem}>
                  <span className={styles.propKey}>{key}:</span>
                  <span className={styles.propValue}>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const calculateTooltipPosition = (element: HTMLElement) => {
    console.log(`element.innerText: ${element.innerText} & element.tagName: ${element.tagName}`);
    const rect = element.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    console.log(`rect.height: ${rect.height}, rect.right: ${rect.right} and rect.top: ${rect.top}`);
    // Try right placement first
    let placement: 'right' | 'bottom' = 'right';
    let x = rect.right + 5;
    let y = rect.top - 170;
    console.log(`before x: ${x} and y: ${y}`);
    // Check if tooltip fits on the right
    if (x + 250 > windowWidth - 20) {
        // Place below instead
        placement = 'bottom';
        x = Math.min(rect.left, windowWidth - 250 - 20);
        y = rect.bottom + 8;
        console.log('inside right fir logic');
    }
    
    // Ensure tooltip doesn't go off screen vertically
    if (y + 150 > windowHeight - 20) {
        y = Math.max(20, windowHeight - 150 - 20);
        console.log('inside tooltip off screen check');
    }
    console.log(`final x: ${x} and y: ${y}`);
    setTooltipPosition({ x, y });
    setTooltipPlacement(placement);
  };

  const renderComponentCard = (component: ComponentDefinition) => {
    if (!component.recipeCard) return null;
    
    const Icon = getIcon(component.type);
    // console.log(`Component: ${component.type} Icon: ${Icon.displayName} and friendly name: ${component.recipeCard.friendlyName}`);
    const hasAccess = canAccessComponent(component);
    const recommendation = isRecommended(component.id);
    const isHovered = hoveredCard === component.id;

    return (
        <div
            key={component.id}
            className={`${styles.recipeCard} ${!hasAccess ? styles.locked : ''} ${
                recommendation ? styles.recommended : ''
            } ${isHovered ? styles.hovered : ''}`}
            onClick={() => handleComponentClick(component)}
            onMouseEnter={(e) => {
                setHoveredCard(component.id);
                calculateTooltipPosition(e.currentTarget);
                setTimeout(() => setShowTooltip(component.id), 300);
            }}
            onMouseLeave={() => {
                setHoveredCard(null);
                setShowTooltip(null);
            }}
            draggable={hasAccess}
            onDragStart={(e) => handleDragStart(e, component)}
            onDragEnd={handleDragEnd}
        >
            {/* REPLACE existing Recommendation Badge with Star */}
            {recommendation && (
            <div className={styles.recommendationStar}>
                <Star size={12} fill="white" color="white" />
            </div>
            )}

            {/* EXISTING Card Header stays the same */}
            <div className={styles.cardHeader}>
                <div className={styles.cardIconWrapper}>
                    <div className={`${styles.cardIcon} ${!hasAccess ? styles.lockedIcon : ''}`}>
                    <Icon size={18} />
                    </div>
                    <div className={styles.cardTitleWrapper}>
                    <h4 className={styles.cardTitle}>
                        {component.recipeCard.friendlyName}
                    </h4>
                    <p className={styles.cardSubtitle}>
                        {component.recipeCard.friendlyDescription}
                    </p>
                    </div>
                </div>

                {!hasAccess && (
                    <div className={styles.planBadge}>
                    <Lock size={10} />
                    <span>{component.minPlan}</span>
                    </div>
                )}
            </div>

            {/* EXISTING Use Case stays the same */}
            <div className={styles.cardUseCase}>
            <strong>Perfect for:</strong> {getPersonaExample(component)}
            </div>

            {/* UPDATE Card Actions for hover-only visibility */}
            {/* {hasAccess ? ( */}
                <div className={`${styles.cardActions} ${styles.actionsVisible}`}>
                    <button 
                        className={styles.addButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleComponentClick(component);
                        }}
                    >
                        <Plus size={14} />
                        <span>Add to form</span>
                    </button>
                </div>
            {/* ) : (
                <div className={`${styles.cardActions} ${isHovered ? styles.actionsVisible : styles.actionsHidden}`}>
                    <button 
                    className={styles.upgradeButton}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedComponent(component);
                        setShowUpgradeModal(true);
                    }}
                    >
                        <Lock size={14} />
                        <span>
                            {component.minPlan === 'ENTERPRISE' ? 'Enterprise Only' : `Upgrade to ${component.minPlan}`}
                        </span>
                    </button>
                </div>
            )} */}
        </div>
        );
    };

  const renderCategorySection = (category: RecipeCategoryInfo, components: ComponentDefinition[]) => {
    if (components.length === 0) return null;

    const CategoryIcon = recipeCategoryIcons[category.id as keyof typeof recipeCategoryIcons];
    const isExpanded = expandedCategories.has(category.id);
    const recommendedCount = components.filter(comp => isRecommended(comp.id)).length;

    return (
      <div key={category.id} className={styles.categorySection}>
        <div 
          className={styles.categoryHeader}
          onClick={() => toggleCategory(category.id)}
        >
          <div className={styles.categoryHeaderLeft}>
            <div className={styles.categoryIcon}>
              <CategoryIcon size={18} />
            </div>
            <div className={styles.categoryInfo}>
              <h3 className={styles.categoryTitle}>{category.label}</h3>
              <p className={styles.categoryDescription}>{category.description}</p>
            </div>
          </div>

          <div className={styles.categoryHeaderRight}>
            {recommendedCount > 0 && (
              <div className={styles.recommendedIndicator}>
                <Star size={12} />
                <span>{recommendedCount} recommended</span>
              </div>
            )}
            <div className={styles.expandIcon}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          </div>
        </div>

        {/* Category Components */}
        {isExpanded && (
          <div className={styles.categoryContent}>
            <div className={styles.componentGrid}>
              {components
                .sort((a, b) => {
                  // Sort recommended components first
                  const aRecommended = isRecommended(a.id);
                  const bRecommended = isRecommended(b.id);
                  
                  if (aRecommended && !bRecommended) return -1;
                  if (!aRecommended && bRecommended) return 1;
                  
                  // Then sort by plan access
                  const aAccess = canAccessComponent(a);
                  const bAccess = canAccessComponent(b);
                  
                  if (aAccess && !bAccess) return -1;
                  if (!aAccess && bAccess) return 1;
                  
                  // Finally sort alphabetically
                  return a.recipeCard!.friendlyName.localeCompare(b.recipeCard!.friendlyName);
                })
                .map(component => renderComponentCard(component))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show/hide categories based on search and showAllCategories
  const visibleCategories = useMemo(() => {
    return recipeCategories.filter((category: RecipeCategoryInfo) => {
      const components = componentsByCategory[category.id] || [];
      return components.length > 0;
    });
  }, [recipeCategories, componentsByCategory]);

  const displayedCategories = showAllCategories 
    ? visibleCategories 
    : visibleCategories.slice(0, 4);

  return (
    <div className={styles.recipeCardList}>
      {/* Category Sections */}
      {displayedCategories.map((category: RecipeCategoryInfo) => 
        renderCategorySection(category, componentsByCategory[category.id] || [])
      )}

      {/* Show More Categories */}
      {!showAllCategories && visibleCategories.length > 4 && (
        <div className={styles.showMoreSection}>
          <button 
            className={styles.showMoreButton}
            onClick={() => setShowAllCategories(true)}
          >
            <ChevronDown size={16} />
            <span>Show {visibleCategories.length - 4} more categories</span>
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className={styles.helpSection}>
        <div className={styles.helpIcon}>
          <HelpCircle size={16} />
        </div>
        <div className={styles.helpContent}>
          <h4>Need help choosing?</h4>
          <p>Not sure which component to use? Our recommendations are based on your role and common form patterns.</p>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedComponent && (
        <UpgradeModal
          component={selectedComponent}
          onClose={() => {
            setShowUpgradeModal(false);
            setSelectedComponent(null);
          }}
        />
      )}

      {/* Tooltip for hovered card */}
        {showTooltip && (
        <PreviewTooltip
            isVisible={!!showTooltip}
            preview={componentsByCategory[Object.keys(componentsByCategory).find(cat => 
            componentsByCategory[cat].find(c => c.id === showTooltip)
            ) || '']?.find(c => c.id === showTooltip)?.recipeCard?.preview || ''}
            position={tooltipPosition}
            placement={tooltipPlacement}
            onClose={() => setShowTooltip(null)}
        />
        )}
    </div>
  );
};