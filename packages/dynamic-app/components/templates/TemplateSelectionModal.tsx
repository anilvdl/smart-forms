import React, { useState, useEffect, useCallback } from 'react';
import styles from './TemplateSelectionModal.module.css';
import { Heart, Search, X, Eye, Check, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  thumbnail: string;
  tags: string[];
  isFavorite?: boolean;
}

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  onSelectMultipleFavorites?: (templateIds: string[]) => void;
}

const CATEGORIES = {
  personal_events: 'Personal Events',
  business: 'Business',
  surveys: 'Surveys'
};

export default function TemplateSelectionModal({
  isOpen,
  onClose,
  onSelectTemplate,
  onSelectMultipleFavorites
}: TemplateSelectionModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<Set<string>>(new Set());

  // Fetch templates
  useEffect(() => {
    if (isOpen) {
      console.log('TemplateSelectionModal opened, fetching templates...');
      fetchTemplates();
    }
  }, [isOpen, selectedCategory, searchTerm]);

  const fetchTemplates = async () => {
    console.log('Fetching templates with category:', selectedCategory, 'and search term:', searchTerm);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      console.log('Search params:', params);

      let url = `/api/templates`;
      if(params.size > 0 && params.toString()) {
        url += `?${params}`;
      }
      console.log('Fetching templates from:', url);
      let response;
      response = await fetch(url);

      const data = await response?.json();
      
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (templateId: string, isFavorite: boolean) => {
    setFavoriteLoading(prev => new Set(prev).add(templateId));
    
    console.log('[handleToggleFavorite] -> templateId: ', templateId, 'isFavorite: ', handleToggleFavorite);
    try {
      const url = isFavorite 
        ? `/api/templates/favorites/${templateId}`
        : '/api/templates/favorites';
      
      const response = await fetch(url, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: !isFavorite ? JSON.stringify({ templateId }) : undefined
      });

      if (response.ok) {
        setTemplates(prev => prev.map(t => 
          t.id === templateId ? { ...t, isFavorite: !isFavorite } : t
        ));
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setFavoriteLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    }
  };

  const handleSelectForBuilder = async (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  const handleAddSelectedToFavorites = async () => {
    if (selectedTemplates.size === 0) {
      toast.warning('Please select at least one template');
      return;
    }

    // Add all selected templates to favorites
    const promises = Array.from(selectedTemplates).map(templateId => 
      fetch('/api/templates/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId })
      })
    );

    try {
      await Promise.all(promises);
      toast.success(`Added ${selectedTemplates.size} templates to favorites`);
      
      if (onSelectMultipleFavorites) {
        onSelectMultipleFavorites(Array.from(selectedTemplates));
      }
      
      setSelectedTemplates(new Set());
      fetchTemplates(); // Refresh to show updated favorites
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Failed to add some templates to favorites');
    }
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(templateId)) {
        newSet.delete(templateId);
      } else {
        newSet.add(templateId);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2>Choose a Template</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalControls}>
          <div className={styles.searchContainer}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.categoryTabs}>
            <button
              className={`${styles.categoryTab} ${!selectedCategory ? styles.active : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              All Templates
            </button>
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                className={`${styles.categoryTab} ${selectedCategory === key ? styles.active : ''}`}
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Loader className={styles.spinner} size={48} />
              <p>Loading templates...</p>
            </div>
          ) : (
            templates.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No templates found for selected category</p>
              </div>
            ) : (
              <div className={styles.templatesGrid}>
                {templates.map(template => (
                  <div 
                    key={template.id} 
                    className={`${styles.templateCard} ${selectedTemplates.has(template.id) ? styles.selected : ''}`}
                  >
                    <div className={styles.templateThumbnail}>
                      {template.thumbnail ? (
                        <img src={template.thumbnail} alt={template.title} />
                      ) : (
                        <div className={styles.placeholderThumbnail}>
                          <span>{template.title.charAt(0)}</span>
                        </div>
                      )}
                      
                      <div className={styles.templateActions}>
                        <button
                          className={styles.favoriteButton}
                          onClick={() => handleToggleFavorite(template.id, template.isFavorite || false)}
                          disabled={favoriteLoading.has(template.id)}
                        >
                          <Heart 
                            size={20} 
                            fill={template.isFavorite ? '#ff6600' : 'none'}
                            color="#ff6600"
                          />
                        </button>
                        
                        <button
                          className={styles.previewButton}
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye size={20} />
                        </button>
                      </div>

                      {selectedTemplates.size > 0 && (
                        <div 
                          className={styles.selectionCheckbox}
                          onClick={() => toggleTemplateSelection(template.id)}
                        >
                          {selectedTemplates.has(template.id) && <Check size={16} />}
                        </div>
                      )}
                    </div>

                    <div className={styles.templateInfo}>
                      <h3>{template.title}</h3>
                      <p>{template.description}</p>
                      
                      <div className={styles.templateTags}>
                        {template.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                      </div>

                      <div className={styles.templateButtons}>
                        <button
                          className={styles.selectButton}
                          onClick={() => toggleTemplateSelection(template.id)}
                        >
                          Select for Favorites
                        </button>
                        <button
                          className={styles.useButton}
                          onClick={() => handleSelectForBuilder(template.id)}
                        >
                          Use This Template
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {selectedTemplates.size > 0 && (
          <div className={styles.modalFooter}>
            <div className={styles.selectionInfo}>
              {selectedTemplates.size} template{selectedTemplates.size > 1 ? 's' : ''} selected
            </div>
            <button
              className={styles.addToFavoritesButton}
              onClick={handleAddSelectedToFavorites}
            >
              Add Selected to Favorites
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUse={() => {
            handleSelectForBuilder(previewTemplate.id);
            setPreviewTemplate(null);
          }}
        />
      )}
    </>
  );
}

// Template Preview Modal Component
function TemplatePreviewModal({ 
  template, 
  onClose, 
  onUse 
}: { 
  template: Template; 
  onClose: () => void;
  onUse: () => void;
}) {
  return (
    <>
      <div className={styles.previewOverlay} onClick={onClose} />
      <div className={styles.previewModal}>
        <div className={styles.previewHeader}>
          <h3>{template.title}</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className={styles.previewContent}>
          {template.thumbnail ? (
            <img src={template.thumbnail} alt={template.title} />
          ) : (
            <div className={styles.previewPlaceholder}>
              <p>Preview not available</p>
            </div>
          )}
          
          <div className={styles.previewInfo}>
            <p className={styles.description}>{template.description}</p>
            <div className={styles.tags}>
              {template.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className={styles.previewActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.useTemplateButton} onClick={onUse}>
            Use This Template
          </button>
        </div>
      </div>
    </>
  );
}