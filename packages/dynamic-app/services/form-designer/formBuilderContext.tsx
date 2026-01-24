// Updated Form Builder Context with Settings Panel Support
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { FormData, FormElement, UserData, mockApi, generateMockFormElement } from './mockData';
import { ComponentDefinition, PlanType } from './componentRegistry';

// Extended form settings interface
interface FormSettings {
  // Layout settings
  labelPosition?: 'top' | 'side';
  labelAlignment?: 'left' | 'right';
  labelWidth?: number;
  fieldSpacing?: number;
  fontSize?: number;
  fontWeight?: number;
  
  // General settings
  title?: string;
  description?: string;
  customId?: string;
  status?: 'draft' | 'published';
  
  // Logo settings
  logo?: {
    url: string;
    size: 'small' | 'medium' | 'large';
    alignment: 'left' | 'center' | 'right';
    width?: number;
    height?: number;
  };
  
  // Submission settings - NESTED OBJECT
  submission?: {
    maxSubmissions?: number | null;
    acceptSubmissions?: boolean;
    confirmationMessage?: string;
    redirectUrl?: string;
    emailNotifications?: {
      enabled: boolean;
      recipients: string;
      subject: string;
    };
    showProgressBar?: boolean;
    requireConfirmation?: boolean;
    allowMultipleSubmissions?: boolean;
  };
  
  // Privacy settings - NESTED OBJECT
  privacy?: {
    isPublic?: boolean;
    requiresPassword?: boolean;
    password?: string;
    allowedUsers?: string[];
    allowedRoles?: string[];
    captchaEnabled?: boolean;
    captchaType?: string;
    ipBlocking?: boolean;
    blockedIPs?: string[];
    dataRetention?: string;
    gdprCompliance?: boolean;
    collectAnalytics?: boolean;
  };
  
  // Advanced settings - NESTED OBJECT
  advanced?: {
    autoSaveInterval?: number;  // THIS IS WHERE autoSaveInterval LIVES NOW
    maxVersions?: number;
    enableVersioning?: boolean;
    webhooks?: Array<{
      id: string;
      name: string;
      url: string;
      events: string[];
      active: boolean;
      secret?: string;
    }>;
    customCSS?: string;
    customJS?: string;
    dataExport?: {
      format: string;
      includeMetadata: boolean;
      compression: boolean;
    };
    performance?: {
      lazyLoading: boolean;
      optimizedImages: boolean;
      cacheTimeout: number;
    };
  };
  
  // Grid and display settings
  showGrid?: boolean;
  gridSize?: number;
  
  // Theme settings
  theme?: 'light' | 'dark';  // FIXED: Literal union type
  customCss?: string;
  backgroundColor?: string;
  backgroundImage?: string;
}


interface FormBuilderState {
  // Form data
  form: FormData | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaveTime: Date | null;
  
  // UI state
  selectedElement: string | null;
  draggedComponent: ComponentDefinition | null;
  draggedElement: FormElement | null;
  hoveredDropZone: number | null;
  
  // User data
  user: UserData | null;
  
  // History
  history: FormElement[][];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  
  // Panels - Added settings panel
  isComponentPanelOpen: boolean;
  isPropertiesPanelOpen: boolean;
  isSettingsPanelOpen: boolean;
  activeView: 'design' | 'code' | 'preview';
  devicePreview: 'desktop' | 'tablet' | 'mobile';
  
  // Settings
  showGrid: boolean;
  gridSize: number;
  zoom: number;
}

interface FormBuilderActions {
  // Form actions
  loadForm: (id: string) => Promise<void>;
  saveForm: () => Promise<void>;
  publishForm: () => Promise<void>;
  
  // Element actions
  addElement: (componentType: string, position?: { x: number; y: number }) => void;
  updateElement: (elementId: string, updates: Partial<FormElement>) => void;
  deleteElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  moveElement: (elementId: string, direction: 'up' | 'down') => void;
  reorderElements: (fromIndex: number, toIndex: number) => void;
  selectElement: (elementId: string | null) => void;
  
  // Drag and drop
  setDraggedComponent: (component: ComponentDefinition | null) => void;
  setDraggedElement: (element: FormElement | null) => void;
  setHoveredDropZone: (index: number | null) => void;
  handleDrop: (dropIndex: number) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  
  // UI actions - Added settings panel
  toggleComponentPanel: () => void;
  togglePropertiesPanel: () => void;
  toggleSettingsPanel: () => void;
  setActiveView: (view: 'design' | 'code' | 'preview') => void;
  setDevicePreview: (device: 'desktop' | 'tablet' | 'mobile') => void;
  toggleGrid: () => void;
  setZoom: (zoom: number) => void;
  
  // Form settings actions
  updateFormSettings: (settings: Partial<FormSettings>) => void;
  resetFormSettings: () => void;
  
  // User actions
  updateUiMode: (mode: 'traditional' | 'recipe') => void;
  canAccessComponent: (component: ComponentDefinition) => boolean;
  trackComponentUsage: (componentType: string, action: 'added' | 'attempted' | 'dragged') => void;
}

type FormBuilderContextType = FormBuilderState & FormBuilderActions;

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (!context) {
    throw new Error('useFormBuilder must be used within FormBuilderProvider');
  }
  return context;
};

interface FormBuilderProviderProps {
  children: React.ReactNode;
  formId: string;
}

const defaultFormSettings: FormSettings = {
  labelPosition: 'top',
  labelAlignment: 'left',
  labelWidth: 30,
  fieldSpacing: 16,
  fontSize: 14,
  fontWeight: 500,
  title: '',
  description: '',
  status: 'draft',
  submission: {
    maxSubmissions: 0, // 0 = unlimited
    confirmationMessage: 'Thank you for your submission!',
    redirectUrl: '',
    emailNotifications: {
      enabled: false,
      recipients: '',
      subject: 'New form submission'
    },
    acceptSubmissions: true,
    showProgressBar: false,
    requireConfirmation: false,
    allowMultipleSubmissions: true
  },
  privacy: {
    isPublic: true,
    requiresPassword: false,
    password: '',
    allowedUsers: [],
    allowedRoles: ['all'],
    captchaEnabled: false,
    captchaType: 'recaptcha',
    ipBlocking: false,
    blockedIPs: [],
    dataRetention: 'forever',
    gdprCompliance: true,
    collectAnalytics: true
  },
  advanced: {
    autoSaveInterval: 30,  // <-- MOVE HERE
    maxVersions: 50,
    enableVersioning: true,
    webhooks: [],
    customCSS: '',
    customJS: '',
    dataExport: {
      format: 'json',
      includeMetadata: true,
      compression: false
    },
    performance: {
      lazyLoading: true,
      optimizedImages: true,
      cacheTimeout: 3600
    }
  },
  theme: 'light',
  showGrid: true,
  gridSize: 20
};

export const FormBuilderProvider: React.FC<FormBuilderProviderProps> = ({ children, formId }) => {
  // State
  const [form, setForm] = useState<FormData | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<ComponentDefinition | null>(null);
  const [draggedElement, setDraggedElement] = useState<FormElement | null>(null);
  const [hoveredDropZone, setHoveredDropZone] = useState<number | null>(null);
  
  const [user, setUser] = useState<UserData | null>(null);
  
  const [history, setHistory] = useState<FormElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Panel state management with session persistence
  const [isComponentPanelOpen, setIsComponentPanelOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartforms_component_panel_open');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartforms_properties_panel_open');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  
  // Settings panel state - defaults to closed
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  const [activeView, setActiveView] = useState<'design' | 'code' | 'preview'>('design');
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [zoom, setZoom] = useState(100);
  
  // Refs
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Persist panel states to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartforms_component_panel_open', JSON.stringify(isComponentPanelOpen));
    }
  }, [isComponentPanelOpen]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartforms_properties_panel_open', JSON.stringify(isPropertiesPanelOpen));
    }
  }, [isPropertiesPanelOpen]);
  
  // Auto-open properties panel when element is selected (desktop only)
  useEffect(() => {
    if (selectedElement && typeof window !== 'undefined' && window.innerWidth >= 1280) {
      if (!isPropertiesPanelOpen) {
        setIsPropertiesPanelOpen(true);
      }
    }
  }, [selectedElement, isPropertiesPanelOpen]);
  
  // Close other panels when settings panel opens
  useEffect(() => {
    if (isSettingsPanelOpen) {
      if (isComponentPanelOpen) setIsComponentPanelOpen(false);
      if (isPropertiesPanelOpen) setIsPropertiesPanelOpen(false);
    }
  }, [isSettingsPanelOpen, isComponentPanelOpen, isPropertiesPanelOpen]);
  
  // Load initial data
  useEffect(() => {
    console.log('>>>>>> inside FormBuilderProvider.....', formId);
    const loadInitialData = async () => {
      try {
        const [userData, formData] = await Promise.all([
          mockApi.getCurrentUser(),
          mockApi.getForm(formId)
        ]);
        console.log(`mock user data: ${userData} and form: ${formData}`);
        setUser(userData);
        if (formData) {
          // Ensure form has settings with defaults
          const formWithSettings = {
            ...formData,
            settings: {
              ...defaultFormSettings,
              ...formData.settings
            }
          };
          setForm(formWithSettings);
          setHistory([formWithSettings.elements]);
          setShowGrid(formWithSettings.settings.showGrid ?? true);
          setGridSize(formWithSettings.settings.gridSize ?? 20);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, [formId]);
  
  // Auto-save logic
  useEffect(() => {
    if (isDirty && form) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          await mockApi.autoSaveForm(form.id, form.elements);
          setLastSaveTime(new Date());
          setIsDirty(false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, form.settings?.advanced?.autoSaveInterval ? form.settings.advanced.autoSaveInterval * 1000 : 30000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isDirty, form]);
  
  // Add to history
  const addToHistory = useCallback((elements: FormElement[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...elements]);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);
  
  // Form actions
  const loadForm = useCallback(async (id: string) => {
    const formData = await mockApi.getForm(id);
    if (formData) {
      const formWithSettings = {
        ...formData,
        settings: {
          ...defaultFormSettings,
          ...formData.settings
        }
      };
      setForm(formWithSettings);
      setHistory([formWithSettings.elements]);
      setHistoryIndex(0);
    }
  }, []);
  
  const saveForm = useCallback(async () => {
    if (!form) return;
    
    setIsSaving(true);
    try {
      const updated = await mockApi.saveForm(form.id, form);
      setForm(updated);
      setLastSaveTime(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [form]);
  
  const publishForm = useCallback(async () => {
    if (!form) return;
    
    setIsSaving(true);
    try {
      const published = await mockApi.publishForm(form.id);
      setForm(published);
      setIsDirty(false);
    } catch (error) {
      console.error('Publish failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [form]);
  
  // Element actions
  const addElement = useCallback((componentType: string, position?: { x: number; y: number }) => {
    if (!form) return;
    
    const newElement = generateMockFormElement(componentType, position);
    const updatedElements = [...form.elements, newElement];
    
    setForm(prev => prev ? { ...prev, elements: updatedElements } : null);
    addToHistory(updatedElements);
    setIsDirty(true);
    setSelectedElement(newElement.id);
    
    // Track component usage
    mockApi.trackComponentUsage(componentType, 'added');
  }, [form, addToHistory]);
  
  const updateElement = useCallback((elementId: string, updates: Partial<FormElement>) => {
    if (!form) return;
    
    const updatedElements = form.elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    
    setForm(prev => prev ? { ...prev, elements: updatedElements } : null);
    addToHistory(updatedElements);
    setIsDirty(true);
  }, [form, addToHistory]);
  
  const deleteElement = useCallback((elementId: string) => {
    if (!form) return;
    
    const updatedElements = form.elements.filter(el => el.id !== elementId);
    
    setForm(prev => prev ? { ...prev, elements: updatedElements } : null);
    addToHistory(updatedElements);
    setIsDirty(true);
    
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  }, [form, selectedElement, addToHistory]);
  
  const duplicateElement = useCallback((elementId: string) => {
    if (!form) return;
    
    const element = form.elements.find(el => el.id === elementId);
    if (!element) return;
    
    const duplicate = {
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    };
    
    const elementIndex = form.elements.findIndex(el => el.id === elementId);
    const updatedElements = [
      ...form.elements.slice(0, elementIndex + 1),
      duplicate,
      ...form.elements.slice(elementIndex + 1)
    ];
    
    setForm(prev => prev ? { ...prev, elements: updatedElements } : null);
    addToHistory(updatedElements);
    setIsDirty(true);
    setSelectedElement(duplicate.id);
  }, [form, addToHistory]);
  
  // NEW: Move Element function
  const moveElement = useCallback((elementId: string, direction: 'up' | 'down') => {
    if (!form) return;
    
    const currentIndex = form.elements.findIndex(el => el.id === elementId);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'up') {
      if (currentIndex === 0) return; // Already at top
      newIndex = currentIndex - 1;
    } else {
      if (currentIndex === form.elements.length - 1) return; // Already at bottom
      newIndex = currentIndex + 1;
    }
    
    const updatedElements = [...form.elements];
    const [movedElement] = updatedElements.splice(currentIndex, 1);
    updatedElements.splice(newIndex, 0, movedElement);
    
    setForm(prev => prev ? { ...prev, elements: updatedElements } : null);
    addToHistory(updatedElements);
    setIsDirty(true);
  }, [form, addToHistory]);
  
  const reorderElements = useCallback((fromIndex: number, toIndex: number) => {
    if (!form) return;
    
    const updatedElements = [...form.elements];
    const [removed] = updatedElements.splice(fromIndex, 1);
    updatedElements.splice(toIndex, 0, removed);
    
    setForm(prev => prev ? { ...prev, elements: updatedElements } : null);
    addToHistory(updatedElements);
    setIsDirty(true);
  }, [form, addToHistory]);
  
  const selectElement = useCallback((elementId: string | null) => {
    setSelectedElement(elementId);
  }, []);
  
  const handleDrop = useCallback((dropIndex: number) => {
    if (!form) return;
    
    if (draggedComponent) {
      // Adding new component
      const newElement = generateMockFormElement(draggedComponent.type);
      const updatedElements = [
        ...form.elements.slice(0, dropIndex),
        newElement,
        ...form.elements.slice(dropIndex)
      ];
      
      setForm(prev => prev ? { ...prev, elements: updatedElements } : null);
      addToHistory(updatedElements);
      setIsDirty(true);
      setSelectedElement(newElement.id);
      
      // Track component usage
      mockApi.trackComponentUsage(draggedComponent.type, 'added');
    } else if (draggedElement) {
      // Reordering existing element
      const currentIndex = form.elements.findIndex(el => el.id === draggedElement.id);
      if (currentIndex !== -1 && currentIndex !== dropIndex) {
        reorderElements(currentIndex, dropIndex);
      }
    }
    
    // Reset drag state
    setDraggedComponent(null);
    setDraggedElement(null);
    setHoveredDropZone(null);
  }, [form, draggedComponent, draggedElement, addToHistory, reorderElements]);
  
  // History actions
  const undo = useCallback(() => {
    if (historyIndex > 0 && form) {
      const newIndex = historyIndex - 1;
      const previousElements = history[newIndex];
      
      setForm(prev => prev ? { ...prev, elements: previousElements } : null);
      setHistoryIndex(newIndex);
      setIsDirty(true);
    }
  }, [historyIndex, history, form]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1 && form) {
      const newIndex = historyIndex + 1;
      const nextElements = history[newIndex];
      
      setForm(prev => prev ? { ...prev, elements: nextElements } : null);
      setHistoryIndex(newIndex);
      setIsDirty(true);
    }
  }, [historyIndex, history, form]);
  
  // Panel toggle functions
  const toggleComponentPanel = useCallback(() => {
    setIsComponentPanelOpen((prev: boolean) => !prev);
  }, []);
  
  const togglePropertiesPanel = useCallback(() => {
    setIsPropertiesPanelOpen((prev: boolean) => !prev);
  }, []);
  
  const toggleSettingsPanel = useCallback(() => {
    setIsSettingsPanelOpen(prev => !prev);
  }, []);
  
  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);
  
  // Form settings actions
  const updateFormSettings = useCallback((settings: Partial<FormSettings>) => {
    if (!form) return;
    
    const updatedForm = {
      ...form,
      settings: {
        ...form.settings,
        ...settings
      }
    };
    
    setForm(updatedForm);
    setIsDirty(true);
    
    // Auto-save settings changes
    setTimeout(async () => {
      try {
        await mockApi.saveForm(updatedForm.id, updatedForm);
        setLastSaveTime(new Date());
        setIsDirty(false);
      } catch (error) {
        console.error('Settings auto-save failed:', error);
      }
    }, 1000);
  }, [form]);
  
  const resetFormSettings = useCallback(() => {
    updateFormSettings(defaultFormSettings);
  }, [updateFormSettings]);
  
  // User actions
  const updateUiMode = useCallback(async (mode: 'traditional' | 'recipe') => {
    if (user) {
      await mockApi.updateUiMode(mode);
      setUser(prev => prev ? { ...prev, uiMode: mode } : null);
    }
  }, [user]);
  
  const canAccessComponent = useCallback((component: ComponentDefinition): boolean => {
    if (!user) return false;
    
    const planHierarchy: Record<PlanType, number> = {
      'FREE': 0,
      'PRO': 1,
      'ENTERPRISE': 2
    };
    
    return planHierarchy[user.plan] >= planHierarchy[component.minPlan];
  }, [user]);
  
  const trackComponentUsage = useCallback(async (componentType: string, action: 'added' | 'attempted' | 'dragged') => {
    try {
      await mockApi.trackComponentUsage(componentType, action);
    } catch (error) {
      console.error('Failed to track component usage:', error);
    }
  }, []);
  
  // Context value
  const value: FormBuilderContextType = {
    // State
    form,
    isDirty,
    isSaving,
    lastSaveTime,
    selectedElement,
    draggedComponent,
    draggedElement,
    hoveredDropZone,
    user,
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    isComponentPanelOpen,
    isPropertiesPanelOpen,
    isSettingsPanelOpen,
    activeView,
    devicePreview,
    showGrid,
    gridSize,
    zoom,
    
    // Actions
    loadForm,
    saveForm,
    publishForm,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    moveElement, // NEW: Added moveElement function
    reorderElements,
    selectElement,
    setDraggedComponent,
    setDraggedElement,
    setHoveredDropZone,
    handleDrop,
    undo,
    redo,
    toggleComponentPanel,
    togglePropertiesPanel,
    toggleSettingsPanel,
    setActiveView,
    setDevicePreview,
    toggleGrid,
    setZoom,
    updateFormSettings,
    resetFormSettings,
    updateUiMode,
    canAccessComponent,
    trackComponentUsage
  };
  
  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
};