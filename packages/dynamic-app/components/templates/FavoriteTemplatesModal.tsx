import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from '@smartforms/shared/icons';
import { X, Heart, Loader, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import styles from './FavoriteTemplatesModal.module.css';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  rawJson: any;
  usageCount: number;
  isFavorite: boolean;
}

interface FavoriteTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  onOpenTemplateModal?: () => void;
}

export default function FavoriteTemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
  onOpenTemplateModal
}: FavoriteTemplatesModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchFavoriteTemplates();
    }
  }, [isOpen]);

  
  const fetchFavoriteTemplates = async () => {  
    setLoading(true);
    try {
        const response = await fetch('/api/templates/favorites');
        if (!response.ok) {
            throw new Error('Failed to fetch favorites');
        }

        // extract only the array from the payload
        const payload = await response.json() as {
            templates?: Template[];
            total?: number;
        };
        console.log( `fetchFavoriteTemplates->payload: ${JSON.stringify(payload)}` );

        const favorites = Array.isArray(payload.templates) ? payload.templates : [];
        setTemplates(favorites);
    } catch (error) {
        console.error('Error fetching favorite templates:', error);
        toast.error('Failed to load favorite templates');
    } finally {
        setLoading(false);
    }
  };

  const handleRemoveFavorite = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/templates/favorites/${templateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        toast.success('Removed from favorites');
      } else {
        throw new Error('Failed to remove favorite');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const handleTemplateClick = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  // Get unique categories from templates
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Your Favorite Templates</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.categoryFilter}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.categorySelect}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loadingState}>
              <Loader className={styles.spinner} size={40} />
              <p>Loading your favorites...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className={styles.emptyState}>
              {templates.length === 0 ? (
                <>
                  <Heart size={48} className={styles.emptyIcon} />
                  <h3>No Favorite Templates Yet</h3>
                  <p>Start adding templates to your favorites from the template gallery!</p>
                  <button 
                    className={styles.browseButton} 
                    onClick={() => {
                      if (onOpenTemplateModal) {
                        // Add slight fade-out effect before closing
                        const modalContent = document.querySelector(`.${styles.modalContent}`);
                        if (modalContent) {
                          modalContent.classList.add(styles.fadeOut);
                        }
                        
                        // Close this modal and open template selection after animation
                        setTimeout(() => {
                          onClose();
                          onOpenTemplateModal();
                        }, 200);
                      } else {
                        onClose();
                      }
                    }}
                  >
                    Browse Templates
                  </button>
                </>
              ) : (
                <>
                  <Search size={48} className={styles.emptyIcon} />
                  <h3>No Results Found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </>
              )}
            </div>
          ) : (
            <div className={styles.templateGrid}>
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={styles.templateCard}
                  onClick={() => handleTemplateClick(template.id)}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.categoryBadge}>{template.category}</span>
                    <button
                      className={styles.favoriteButton}
                      onClick={(e) => handleRemoveFavorite(template.id, e)}
                      title="Remove from favorites"
                    >
                      <Heart size={20} fill="#ff6600" color="#ff6600" />
                    </button>
                  </div>
                  
                  <div className={styles.cardThumbnail}>
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.title}
                        className={styles.thumbnailImage}
                      />
                    ) : (
                    //   <Image
                    //     src={Icons['blank-form']}
                    //     alt={template.title}
                    //     width={100}
                    //     height={100}
                    //   />
                        <div className={styles.placeholderThumbnail}>
                          <span>{template.title.charAt(0)}</span>
                        </div>
                    )}
                  </div>
                  
                  <div className={styles.cardContent}>
                    <h4>{template.title}</h4>
                    <p>{template.description}</p>
                    <div className={styles.cardStats}>
                      <span className={styles.usageCount}>
                        Used {template.usageCount} times
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with count */}
        {!loading && templates.length > 0 && (
          <div className={styles.modalFooter}>
            <p className={styles.templateCount}>
              Showing {filteredTemplates.length} of {templates.length} favorite templates
            </p>
          </div>
        )}
      </div>
    </div>
  );
}