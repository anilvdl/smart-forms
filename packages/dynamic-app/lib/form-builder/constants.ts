import { PlanType } from './schema'

// Plan hierarchy for comparison
export const PLAN_HIERARCHY: Record<PlanType, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
}

// Plan features and limits
export const PLAN_FEATURES = {
  FREE: {
    maxForms: 5,
    maxFieldsPerForm: 25,
    maxSubmissionsPerMonth: 100,
    fileUploadSizeMB: 5,
    customBranding: false,
    conditionalLogic: false,
    apiAccess: false,
  },
  PRO: {
    maxForms: 50,
    maxFieldsPerForm: 100,
    maxSubmissionsPerMonth: 5000,
    fileUploadSizeMB: 25,
    customBranding: true,
    conditionalLogic: true,
    apiAccess: true,
  },
  ENTERPRISE: {
    maxForms: -1, // Unlimited
    maxFieldsPerForm: -1, // Unlimited
    maxSubmissionsPerMonth: -1, // Unlimited
    fileUploadSizeMB: 100,
    customBranding: true,
    conditionalLogic: true,
    apiAccess: true,
  },
}

// Component access check
export const canAccessComponent = (
  componentMinPlan: PlanType,
  userPlan: PlanType
): boolean => {
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[componentMinPlan]
}

// Grid configuration
export const GRID_CONFIG = {
  columns: 12,
  gap: 16, // pixels
  minColumnWidth: 80, // pixels
  snapThreshold: 8, // pixels
}

// Auto-save configuration
export const AUTO_SAVE_CONFIG = {
  localStorageInterval: 30 * 1000, // 30 seconds
  serverSyncInterval: 2 * 60 * 1000, // 2 minutes
  debounceDelay: 1000, // 1 second
}

// History configuration
export const HISTORY_CONFIG = {
  maxHistorySize: 50,
  maxRedoSize: 20,
}

// Drag and drop configuration
export const DRAG_DROP_CONFIG = {
  dragThreshold: 5, // pixels before drag starts
  scrollSpeed: 10, // pixels per frame when auto-scrolling
  scrollThreshold: 50, // pixels from edge to start auto-scroll
}

// Component icons mapping
export const COMPONENT_ICONS: Record<string, string> = {
  // Basic
  text: 'i-lucide-text-cursor-input',
  email: 'i-lucide-mail',
  password: 'i-lucide-key',
  number: 'i-lucide-hash',
  phone: 'i-lucide-phone',
  url: 'i-lucide-link',
  textarea: 'i-lucide-align-left',
  hidden: 'i-lucide-eye-off',
  readonly: 'i-lucide-lock',
  color: 'i-lucide-palette',
  range: 'i-lucide-sliders',
  search: 'i-lucide-search',
  
  // Selection
  radio: 'i-lucide-circle-dot',
  checkbox: 'i-lucide-square-check',
  dropdown: 'i-lucide-chevron-down-square',
  multiselect: 'i-lucide-list-checks',
  toggle: 'i-lucide-toggle-left',
  yesno: 'i-lucide-thumbs-up',
  rating_stars: 'i-lucide-star',
  rating_numbers: 'i-lucide-hash',
  likert: 'i-lucide-bar-chart-horizontal',
  image_choice: 'i-lucide-image',
  
  // Date & Time
  date: 'i-lucide-calendar',
  time: 'i-lucide-clock',
  datetime: 'i-lucide-calendar-clock',
  daterange: 'i-lucide-calendar-range',
  timerange: 'i-lucide-clock-3',
  appointment: 'i-lucide-calendar-check',
  
  // File & Media
  file_single: 'i-lucide-file',
  file_multiple: 'i-lucide-files',
  image_upload: 'i-lucide-image-plus',
  document_upload: 'i-lucide-file-text',
  dropzone: 'i-lucide-upload-cloud',
  
  // Layout
  divider: 'i-lucide-minus',
  pagebreak: 'i-lucide-file-plus',
  section: 'i-lucide-layers',
  html: 'i-lucide-code',
  heading: 'i-lucide-heading',
  paragraph: 'i-lucide-text',
  spacer: 'i-lucide-expand',
  progress: 'i-lucide-loader',
  
  // Advanced
  signature: 'i-lucide-pen-tool',
  location: 'i-lucide-map-pin',
  captcha: 'i-lucide-shield-check',
  matrix: 'i-lucide-grid-3x3',
  table: 'i-lucide-table',
  qrcode: 'i-lucide-qr-code',
  
  // Composite
  fullname: 'i-lucide-user',
  address: 'i-lucide-home',
  contact: 'i-lucide-contact',
  emergency: 'i-lucide-siren',
  
  // Default
  default: 'i-lucide-box',
}

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  'cmd+k,ctrl+k': 'openComponentSearch',
  'cmd+s,ctrl+s': 'saveForm',
  'cmd+z,ctrl+z': 'undo',
  'cmd+shift+z,ctrl+shift+z': 'redo',
  'cmd+c,ctrl+c': 'copyElement',
  'cmd+v,ctrl+v': 'pasteElement',
  'cmd+d,ctrl+d': 'duplicateElement',
  'delete,backspace': 'deleteElement',
  'escape': 'closePanels',
  'cmd+p,ctrl+p': 'previewForm',
  'cmd+shift+p,ctrl+shift+p': 'publishForm',
}

// Default form settings
export const DEFAULT_FORM_SETTINGS = {
  submitButton: {
    text: 'Submit',
    position: 'left' as const,
  },
  successMessage: 'Thank you for your submission!',
  errorMessage: 'There was an error submitting the form. Please try again.',
}

// Validation error messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  minLength: 'Must be at least {min} characters',
  maxLength: 'Must be no more than {max} characters',
  minValue: 'Must be at least {min}',
  maxValue: 'Must be no more than {max}',
  pattern: 'Invalid format',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  phone: 'Please enter a valid phone number',
}