import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Icons } from '@smartforms/shared/icons';
import { 
  Eye, 
  Copy, 
  Share2, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  FileText,
  Search,
  Filter,
  Loader,
  Calendar,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import ShareEmbedModal from './ShareEmbedModal';
import styles from './MyFormsTab.module.css';

interface Form {
  formId: string;
  version: number;
  title: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  thumbnail?: string;
  shortCode?: string;
  isPublic: boolean;
  sourceTemplateId?: string;
  isOrgForm: boolean;
  isOwner: boolean;
}

interface MyFormsTabProps {
  isActive: boolean;
}

export default function MyFormsTab({ isActive }: MyFormsTabProps) {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'updated_at'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Refs for dropdown click outside handling
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch forms
  const fetchForms = useCallback(async (pageNum: number, append = false) => {
    if (!isActive) return;
    
    setLoading(!append);
    setIsLoadingMore(append);
    
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        search: searchTerm,
        sortBy,
        sortOrder
      });
      
      const response = await fetch(`/api/forms/designer/published?${params}`);
      if (!response.ok) throw new Error('Failed to fetch forms');
      
      const data = await response.json();
      
      if (append) {
        setForms(prev => [...prev, ...data.forms]);
      } else {
        setForms(data.forms);
      }
      
      setTotalPages(data.pagination.totalPages);
      setHasMore(pageNum < data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [isActive, searchTerm, sortBy, sortOrder]);

  // Initial load and search/sort changes
  useEffect(() => {
    if (isActive) {
      setPage(1);
      fetchForms(1);
    }
  }, [isActive, searchTerm, sortBy, sortOrder]);

  // Load more functionality
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchForms(nextPage, true);
    }
  };

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const dropdownRef = dropdownRefs.current[activeDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Action handlers
  const handleView = (form: Form) => {
    if (form.shortCode) {
      window.open(`/f/${form.shortCode}`, '_blank');
    } else {
      toast.error('Form URL not available');
    }
  };

  const handleCopyLink = async (form: Form) => {
    if (!form.shortCode) {
      toast.error('Form URL not available');
      return;
    }
    
    const url = `${window.location.origin}/f/${form.shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Form link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.body.removeChild(textArea);
      toast.success('Form link copied to clipboard!');
    }
    setActiveDropdown(null);
  };

  const handleClone = async (form: Form) => {
    try {
      const response = await fetch(`/api/forms/designer/${form.formId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: form.version })
      });
      
      if (!response.ok) throw new Error('Failed to clone form');
      
      const data = await response.json();
      toast.success('Form cloned successfully!');
      
      // Navigate to form builder with new form
      router.push(`/form-builder?formId=${data.formId}&version=${data.version}`);
    } catch (error) {
      console.error('Error cloning form:', error);
      toast.error('Failed to clone form');
    }
    setActiveDropdown(null);
  };

  const handleEdit = async (form: Form) => {
    // Edit creates a new form (clone)
    const confirmEdit = window.confirm(
      'Editing a published form will create a new draft version. Continue?'
    );
    
    if (confirmEdit) {
      handleClone(form);
    }
    setActiveDropdown(null);
  };

  const handleDelete = async (form: Form) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${form.title}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        const response = await fetch(
          `/api/forms/designer/${form.formId}/${form.version}`,
          { method: 'DELETE' }
        );
        
        if (!response.ok) throw new Error('Failed to delete form');
        
        toast.success('Form deleted successfully');
        // Refresh the list
        setPage(1);
        fetchForms(1);
      } catch (error) {
        console.error('Error deleting form:', error);
        toast.error('Failed to delete form');
      }
    }
    setActiveDropdown(null);
  };

  const handleShare = (form: Form) => {
    setSelectedForm(form);
    setIsShareModalOpen(true);
    setActiveDropdown(null);
  };

  const toggleDropdown = (formId: string) => {
    setActiveDropdown(activeDropdown === formId ? null : formId);
  };

  if (!isActive) return null;

  return (
    <div className={styles.container}>
      {/* Search and Filter Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search your forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterControls}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'updated_at')}
            className={styles.sortSelect}
          >
            <option value="updated_at">Last Modified</option>
            <option value="title">Title</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            className={styles.sortOrderBtn}
            title={`Sort ${sortOrder === 'ASC' ? 'Descending' : 'Ascending'}`}
          >
            <Filter size={18} />
            {sortOrder === 'ASC' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Forms Grid */}
      {loading && forms.length === 0 ? (
        <div className={styles.loadingState}>
          <Loader className={styles.spinner} size={40} />
          <p>Loading your forms...</p>
        </div>
      ) : forms.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={48} className={styles.emptyIcon} />
          <h3>No Published Forms Yet</h3>
          <p>Your published forms will appear here once you publish them from the form builder.</p>
        </div>
      ) : (
        <>
          <div className={styles.formsGrid}>
            {forms.map((form) => (
              <div key={`${form.formId}-${form.version}`} className={styles.formCard}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardBadges}>
                    {form.sourceTemplateId && (
                      <span className={styles.templateBadge}>Template</span>
                    )}
                    {form.isOrgForm && (
                      <span className={styles.orgBadge}>Organization</span>
                    )}
                    <span className={`${styles.statusBadge} ${styles[form.status?.toLowerCase()]}`}>
                      {form.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                      {form.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  
                  <div
                    ref={el => { dropdownRefs.current[form.formId] = el; }}
                    className={styles.dropdownWrapper}
                  >
                    <button
                      className={styles.moreButton}
                      onClick={() => toggleDropdown(form.formId)}
                      title="More actions"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {activeDropdown === form.formId && (
                      <div className={styles.dropdown}>
                        <button onClick={() => handleView(form)} className={styles.dropdownItem}>
                          <Eye size={16} />
                          View Form
                        </button>
                        <button onClick={() => handleCopyLink(form)} className={styles.dropdownItem}>
                          <Copy size={16} />
                          Copy Link
                        </button>
                        <button onClick={() => handleShare(form)} className={styles.dropdownItem}>
                          <Share2 size={16} />
                          Share & Embed
                        </button>
                        <button onClick={() => handleEdit(form)} className={styles.dropdownItem}>
                          <Edit3 size={16} />
                          Edit (Clone)
                        </button>
                        <hr className={styles.dropdownDivider} />
                        <button 
                          onClick={() => handleDelete(form)} 
                          className={`${styles.dropdownItem} ${styles.deleteItem}`}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Thumbnail */}
                <div className={styles.cardThumbnail}>
                  {form.thumbnail ? (
                    <Image
                      src={form.thumbnail}
                      alt={form.title}
                      fill
                      className={styles.thumbnailImage}
                    />
                  ) : (
                    <div className={styles.defaultThumbnail}>
                      <FileText size={32} />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className={styles.cardContent}>
                  <h3 className={styles.formTitle} title={form.title}>
                    {form.title}
                  </h3>
                  
                  <div className={styles.formMeta}>
                    <div className={styles.metaItem}>
                      <Calendar size={14} />
                      <span>Updated {formatDate(form.updatedAt)}</span>
                    </div>
                    
                    {form.shortCode && (
                      <div className={styles.metaItem}>
                        <span className={styles.shortCode}>/{form.shortCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className={styles.cardActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleView(form)}
                    title="View form"
                  >
                    <Eye size={18} />
                    View
                  </button>
                  
                  <button
                    className={styles.actionButton}
                    onClick={() => handleClone(form)}
                    title="Clone form"
                  >
                    <Copy size={18} />
                    Clone
                  </button>
                  
                  <button
                    className={styles.actionButton}
                    onClick={() => handleShare(form)}
                    title="Share form"
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className={styles.loadMoreWrapper}>
              <button
                className={styles.loadMoreButton}
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader className={styles.spinner} size={16} />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Share/Embed Modal */}
      {selectedForm && (
        <ShareEmbedModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedForm(null);
          }}
          formId={selectedForm.formId}
          version={selectedForm.version}
          formTitle={selectedForm.title}
        />
      )}
    </div>
  );
}