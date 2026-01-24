import React, { ReactNode } from 'react'
import type { JSX } from 'react'

// Plan types
export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE'

// User persona types
export type UserPersona = 'business' | 'technical' | 'educator' | 'healthcare' | 'enterprise' | 'casual'

// UI Mode types
export type UIMode = 'traditional' | 'recipe'

// Component categories
export enum ComponentCategory {
  BASIC = 'basic',
  SELECTION = 'selection',
  DATETIME = 'datetime',
  FILE_MEDIA = 'file_media',
  LAYOUT = 'layout',
  ADVANCED = 'advanced',
  COMPOSITE = 'composite',
  PAYMENT = 'payment', // Phase 2
}

// Recipe card categories (user-friendly)
export enum RecipeCategory {
  COLLECT_INFO = 'collect_info',
  MAKE_CHOICES = 'make_choices',
  SCHEDULE_TIME = 'schedule_time',
  UPLOAD_FILES = 'upload_files',
  ORGANIZE_FORM = 'organize_form',
  SPECIAL_FIELDS = 'special_fields',
}

// Base component interface
export interface BaseFormComponent {
  // Identification
  id: string
  type: string
  
  // Data
  name: string
  value?: any
  defaultValue?: any
  
  // Display
  label: string | RichTextContent
  placeholder?: string
  helpText?: string
  
  // Validation
  required?: boolean
  validation?: ValidationRule[]
  
  // Styling
  className?: string
  style?: React.CSSProperties
  width?: string | number
  
  // Behavior
  disabled?: boolean
  readOnly?: boolean
  hidden?: boolean
  
  // Conditional logic
  showIf?: ConditionalRule
  hideIf?: ConditionalRule
  
  // Grid positioning
  gridColumn?: string
  gridRow?: string
}

// Rich text content for labels
export interface RichTextContent {
  html: string
  text: string
}

// Validation types
export interface ValidationRule {
  type: ValidationType
  value?: any
  message?: string
}

export enum ValidationType {
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  MIN_VALUE = 'minValue',
  MAX_VALUE = 'maxValue',
  PATTERN = 'pattern',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  CUSTOM = 'custom',
  REQUIRED = 'required',
}

// Conditional logic
export interface ConditionalRule {
  field: string
  operator: ConditionalOperator
  value: any
}

export enum ConditionalOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'notEquals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  GREATER_THAN = 'greaterThan',
  LESS_THAN = 'lessThan',
  IS_EMPTY = 'isEmpty',
  IS_NOT_EMPTY = 'isNotEmpty',
}

// Component definition for registry
export interface ComponentDefinition  {
  // Component metadata
  id: string
  type: string
  category: ComponentCategory
  
  // Display information
  label: string
  description: string
  icon: string
  preview?: ReactNode
  
  // Plan restrictions
  minPlan: PlanType
  trialAllowed?: boolean
  
  // Search optimization
  searchTags: string[]
  aliases: string[]
  
  // Recipe card specific
  recipeCard?: {
    friendlyName: string
    friendlyDescription: string
    exampleText: string
    commonUseCase: string
    category: RecipeCategory
  }
  
  // Component loading
  loader: () => Promise<ComponentModule>
  
  // Default configuration
  defaultProps: Record<string, any>
  
  // Validation rules available
  supportedValidations: ValidationType[]
  
  // Property schema
  propertySchema: PropertySchema
}

// Component module interface
export interface ComponentModule {
  component: React.ComponentType<any>
  render: (props: BaseFormComponent) => JSX.Element
  validate: (value: any, rules: ValidationRule[]) => ValidationResult
}

// Property schema for properties panel
export interface PropertySchema {
  groups: PropertyGroup[]
}

export interface PropertyGroup {
  label: string
  collapsible?: boolean
  defaultExpanded?: boolean
  properties: PropertyDefinition[]
}

export interface PropertyDefinition {
  key: string
  label: string
  type: PropertyType
  defaultValue?: any
  options?: Array<{ label: string; value: any }>
  placeholder?: string
  helpText?: string
  showIf?: (props: BaseFormComponent) => boolean
}

export enum PropertyType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  RICH_TEXT = 'richText',
  COLOR = 'color',
  OPTIONS = 'options',
  VALIDATION_RULES = 'validationRules',
  CONDITIONAL_LOGIC = 'conditionalLogic',
}

// Validation result
export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

// Form schema
export interface FormSchema {
  id: string
  title: string
  description?: string
  version: number
  elements: FormElement[]
  settings: FormSettings
  createdAt: Date
  updatedAt: Date
  createdWithUI: UIMode
}

// Form element (component instance)
export interface FormElement extends BaseFormComponent {
  elementId: string // Unique instance ID
}

// Form settings
export interface FormSettings {
  submitButton: {
    text: string
    position: 'left' | 'center' | 'right'
  }
  successMessage: string
  errorMessage: string
  redirectUrl?: string
  notifications?: {
    email?: string[]
    webhook?: string
  }
  branding?: {
    logo?: string
    primaryColor?: string
    font?: string
  }
}

// Form builder state
export interface FormBuilderState {
  // Form data
  formId: string
  formSchema: FormSchema
  selectedElement: string | null
  
  // UI state
  uiMode: UIMode
  isPanelOpen: boolean
  isPropertiesOpen: boolean
  canvasZoom: number
  gridVisible: boolean
  
  // History
  history: FormSchema[]
  historyIndex: number
  maxHistorySize: number
  
  // Auto-save
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  isSaving: boolean
  autoSaveEnabled: boolean
  
  // Drag and drop
  isDragging: boolean
  draggedComponent: ComponentDefinition | null
  draggedElement: FormElement | null
  dropTarget: string | null
}