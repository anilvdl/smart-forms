// Updated Mock Data Service for SmartForms Designer - FIXED INTERFACES
import { ComponentDefinition, PlanType } from './componentRegistry';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
export interface UserData {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  persona: 'business' | 'technical' | 'educator' | 'healthcare' | 'enterprise' | 'casual';
  uiMode: 'traditional' | 'recipe';
  organization: {
    id: string;
    name: string;
  };
}

// UPDATED FormSettings interface to match formBuilderContext.tsx
export interface FormSettings {
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
  
  // Submission settings
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
  
  // Privacy settings
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
  
  // Advanced settings
  advanced?: {
    autoSaveInterval?: number;
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
  
  // Theme settings - FIXED: Use literal union type
  theme?: 'light' | 'dark';
  customCss?: string;
  backgroundColor?: string;
  backgroundImage?: string;
}

// Mock form data
export interface FormData {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  lastSavedAt?: Date;
  version: number;
  elements: FormElement[];
  settings: FormSettings;
}

export interface FormElement {
  id: string;
  type: string;
  props: Record<string, any>;
  position: {
    x: number;
    y: number;
  };
}

// Mock API service
class MockApiService {
  private currentUser: UserData = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'PRO',
    persona: 'business',
    uiMode: 'recipe',
    organization: {
      id: 'org-123',
      name: 'Acme Corp'
    }
  };

  private forms: Map<string, FormData> = new Map();
  private formVersions: Map<string, FormData[]> = new Map();

  constructor() {
    // Initialize with sample form with COMPLETE settings
    const sampleForm: FormData = {
      id: 'form-123',
      title: 'Contact Form',
      description: 'Sample contact form',
      status: 'draft',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-15'),
      lastSavedAt: new Date('2025-01-15T10:30:00'),
      version: 1,
      elements: [],
      settings: {
        // Layout settings
        labelPosition: 'top',
        labelAlignment: 'left',
        labelWidth: 30,
        fieldSpacing: 16,
        fontSize: 14,
        fontWeight: 500,
        
        // General settings
        title: 'Contact Form',
        description: 'Sample contact form',
        status: 'draft',
        
        // Submission settings
        submission: {
          maxSubmissions: null,
          acceptSubmissions: true,
          confirmationMessage: 'Thank you for your submission!',
          redirectUrl: '',
          emailNotifications: {
            enabled: false,
            recipients: '',
            subject: 'New form submission'
          },
          showProgressBar: false,
          requireConfirmation: false,
          allowMultipleSubmissions: true
        },
        
        // Privacy settings
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
        
        // Advanced settings - FIXED: Include autoSaveInterval
        advanced: {
          autoSaveInterval: 30,
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
        
        // Grid and display settings
        showGrid: true,
        gridSize: 20,
        
        // Theme settings - FIXED: Use literal type
        theme: 'light' as 'light' | 'dark',
        customCss: '',
        backgroundColor: '#ffffff',
        backgroundImage: ''
      }
    };
    this.forms.set(sampleForm.id, sampleForm);
    this.formVersions.set(sampleForm.id, [sampleForm]);
  }

  // User API
  async getCurrentUser(): Promise<UserData> {
    await delay(300);
    return { ...this.currentUser };
  }

  async updateUserPreferences(preferences: Partial<UserData>): Promise<UserData> {
    await delay(500);
    this.currentUser = { ...this.currentUser, ...preferences };
    return { ...this.currentUser };
  }

  async updateUiMode(mode: 'traditional' | 'recipe'): Promise<void> {
    await delay(300);
    this.currentUser.uiMode = mode;
  }

  // Form API
  async getForm(id: string): Promise<FormData | null> {
    await delay(500);
    const form = this.forms.get('form-123'); // hardcode, id is randomly generated so no form data returns
    return form ? { ...form } : null;
  }

  async saveForm(id: string, updates: Partial<FormData>): Promise<FormData> {
    await delay(800);
    const existing = this.forms.get(id);
    if (!existing) {
      throw new Error('Form not found');
    }

    const updated: FormData = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
      lastSavedAt: new Date()
    };

    this.forms.set(id, updated);
    return { ...updated };
  }

  async autoSaveForm(id: string, elements: FormElement[]): Promise<void> {
    await delay(200);
    const form = this.forms.get(id);
    if (form) {
      form.elements = elements;
      form.lastSavedAt = new Date();
    }
  }

  async publishForm(id: string): Promise<FormData> {
    await delay(1000);
    const form = this.forms.get(id);
    if (!form) {
      throw new Error('Form not found');
    }

    const published: FormData = {
      ...form,
      status: 'published',
      updatedAt: new Date(),
      version: form.version + 1
    };

    this.forms.set(id, published);
    
    // Add to version history
    const versions = this.formVersions.get(id) || [];
    versions.push({ ...published });
    this.formVersions.set(id, versions);

    return published;
  }

  async getFormVersions(id: string): Promise<FormData[]> {
    await delay(600);
    return this.formVersions.get(id) || [];
  }

  async restoreVersion(formId: string, versionNumber: number): Promise<FormData> {
    await delay(800);
    const versions = this.formVersions.get(formId) || [];
    const version = versions.find(v => v.version === versionNumber);
    
    if (!version) {
      throw new Error('Version not found');
    }

    const restored: FormData = {
      ...version,
      updatedAt: new Date(),
      lastSavedAt: new Date()
    };

    this.forms.set(formId, restored);
    return restored;
  }

  // Form Elements API
  async addElement(formId: string, element: FormElement): Promise<void> {
    await delay(100);
    const form = this.forms.get(formId);
    if (form) {
      form.elements.push(element);
      form.updatedAt = new Date();
    }
  }

  async updateElement(formId: string, elementId: string, updates: Partial<FormElement>): Promise<void> {
    await delay(100);
    const form = this.forms.get(formId);
    if (form) {
      const element = form.elements.find(el => el.id === elementId);
      if (element) {
        Object.assign(element, updates);
        form.updatedAt = new Date();
      }
    }
  }

  async deleteElement(formId: string, elementId: string): Promise<void> {
    await delay(100);
    const form = this.forms.get(formId);
    if (form) {
      form.elements = form.elements.filter(el => el.id !== elementId);
      form.updatedAt = new Date();
    }
  }

  async reorderElements(formId: string, elementIds: string[]): Promise<void> {
    await delay(100);
    const form = this.forms.get(formId);
    if (form) {
      const elementMap = new Map(form.elements.map(el => [el.id, el]));
      form.elements = elementIds.map(id => elementMap.get(id)!).filter(Boolean);
      form.updatedAt = new Date();
    }
  }

  // Component Usage Tracking
  async trackComponentUsage(componentType: string, action: 'added' | 'attempted' | 'dragged'): Promise<void> {
    await delay(50);
    // In real implementation, this would track usage for analytics
    console.log(`Component ${componentType} ${action}`);
  }

  // Error Simulation
  async simulateError(type: 'network' | 'validation' | 'permission' | 'system'): Promise<never> {
    await delay(500);
    
    switch (type) {
      case 'network':
        throw new Error('Network connection failed. Please check your internet connection.');
      case 'validation':
        throw new Error('Invalid form data. Please check your inputs.');
      case 'permission':
        throw new Error('You do not have permission to perform this action.');
      case 'system':
        throw new Error('An unexpected system error occurred. Please try again later.');
    }
  }
}

// Export singleton instance
export const mockApi = new MockApiService();

// Helper functions for mock data generation
export const generateMockFormElement = (type: string, position = { x: 0, y: 0 }): FormElement => {
  const id = `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Get default props from component registry
  const baseProps = {
    label: `New ${type} field`,
    name: `field_${id}`,
    required: false
  };

  return {
    id,
    type,
    props: baseProps,
    position
  };
};

export const generateDropPosition = (dragY: number, elements: FormElement[]): number => {
  // Calculate drop position based on Y coordinate
  const ELEMENT_HEIGHT = 80; // Approximate height of each element
  const dropIndex = Math.floor(dragY / ELEMENT_HEIGHT);
  return Math.min(dropIndex, elements.length);
};

// Mock data for templates
export const formTemplates = [
  {
    id: 'template-contact',
    name: 'Contact Form',
    description: 'Basic contact form with name, email, and message',
    thumbnail: '📧',
    elements: [
      { type: 'text', props: { label: 'Name', required: true } },
      { type: 'email', props: { label: 'Email', required: true } },
      { type: 'textarea', props: { label: 'Message', rows: 4 } }
    ]
  },
  {
    id: 'template-feedback',
    name: 'Feedback Survey',
    description: 'Customer satisfaction survey',
    thumbnail: '⭐',
    elements: [
      { type: 'rating-stars', props: { label: 'Overall Satisfaction' } },
      { type: 'textarea', props: { label: 'Comments', rows: 3 } },
      { type: 'yesno', props: { label: 'Would you recommend us?' } }
    ]
  },
  {
    id: 'template-registration',
    name: 'Event Registration',
    description: 'Event signup with attendee information',
    thumbnail: '🎫',
    elements: [
      { type: 'fullname', props: { label: 'Full Name', required: true } },
      { type: 'email', props: { label: 'Email', required: true } },
      { type: 'phone', props: { label: 'Phone Number' } },
      { type: 'checkbox', props: { 
        label: 'Dietary Restrictions',
        options: ['Vegetarian', 'Vegan', 'Gluten-free', 'None']
      }}
    ]
  }
];

// Onboarding step interface
export interface OnboardingStep {
  target: string;
  content: string;
  placement: 'top' | 'right' | 'bottom' | 'left' | 'center';
}

// Mock onboarding steps
export const onboardingSteps: OnboardingStep[] = [
  {
    target: '.componentPanel',
    content: 'This is your component panel. Drag elements from here to build your form.',
    placement: 'right'
  },
  {
    target: '.canvas',
    content: 'Drop components here to add them to your form. You can rearrange them by dragging.',
    placement: 'center'
  },
  {
    target: '.uiModeToggle',
    content: 'Switch between Traditional and Recipe Card views based on your preference.',
    placement: 'bottom'
  },
  {
    target: '.saveButton',
    content: 'Your form auto-saves, but you can manually save anytime.',
    placement: 'bottom'
  },
  {
    target: '.publishButton',
    content: 'When ready, publish your form to make it available to users.',
    placement: 'bottom'
  }
];