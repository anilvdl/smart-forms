import { 
  ComponentDefinition, 
  ComponentCategory, 
  ComponentGroup, 
  PlanType,
  ComponentStats,
  RegistryValidation,
  RegistryMetadata,
  ComponentRegistry,
} from './interfaces';

const allComponents: ComponentDefinition[] = [
  // ==============================
  // BASIC COMPONENTS (12)
  // ==============================
  {
    id: 'text-input',
    type: 'input',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Text Input',
    description: 'Single line text input field',
    icon: 'type',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['text', 'input', 'field', 'basic'],
    defaultProps: {
      label: 'Text Field',
      placeholder: 'Enter text...',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto',
        color: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'email-input',
    type: 'email',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Email Input',
    description: 'Email address input with validation',
    icon: 'mail',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['email', 'input', 'validation', 'contact'],
    defaultProps: {
      label: 'Email Address',
      placeholder: 'Enter email address...',
      required: false,
      validation: {
        rules: ['email'],
        messages: {
          email: 'Please enter a valid email address'
        }
      },
      styles: {
        width: '100%',
        height: 'auto',
        color: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'password-input',
    type: 'password',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Password Input',
    description: 'Secure password input field',
    icon: 'key',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['password', 'secure', 'input', 'auth'],
    defaultProps: {
      label: 'Password',
      placeholder: 'Enter password...',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto',
        color: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'number-input',
    type: 'number',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Number Input',
    description: 'Numeric input with validation',
    icon: 'hash',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['number', 'numeric', 'input', 'validation'],
    defaultProps: {
      label: 'Number Field',
      placeholder: 'Enter number...',
      required: false,
      validation: {
        rules: ['number'],
        messages: {
          number: 'Please enter a valid number'
        }
      },
      styles: {
        width: '100%',
        height: 'auto',
        color: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'phone-input',
    type: 'phone',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Phone Input',
    description: 'Phone number input with formatting',
    icon: 'phone',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['phone', 'telephone', 'contact', 'number'],
    defaultProps: {
      label: 'Phone Number',
      placeholder: 'Enter phone number...',
      required: false,
      validation: {
        rules: ['phone'],
        messages: {
          phone: 'Please enter a valid phone number'
        }
      },
      styles: {
        width: '100%',
        height: 'auto',
        color: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'url-input',
    type: 'url',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'URL Input',
    description: 'Website URL input with validation',
    icon: 'link',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['url', 'website', 'link', 'validation'],
    defaultProps: {
      label: 'Website URL',
      placeholder: 'https://example.com',
      required: false,
      validation: {
        rules: ['url'],
        messages: {
          url: 'Please enter a valid URL'
        }
      },
      styles: {
        width: '100%',
        height: 'auto',
        color: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'textarea',
    type: 'textarea',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Textarea',
    description: 'Multi-line text input area',
    icon: 'file-text',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['textarea', 'multiline', 'text', 'long'],
    defaultProps: {
      label: 'Message',
      placeholder: 'Enter your message...',
      required: false,
      rows: 4,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto',
        color: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'rich-text',
    type: 'editor',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Rich Text Editor',
    description: 'WYSIWYG text editor with formatting',
    icon: 'edit-3',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['rich', 'text', 'editor', 'wysiwyg', 'formatting'],
    defaultProps: {
      label: 'Rich Text Content',
      placeholder: 'Enter formatted text...',
      required: false,
      toolbar: ['bold', 'italic', 'underline', 'list'],
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: '200px',
        color: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'search-input',
    type: 'search',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Search Input',
    description: 'Search input field with magnifying glass icon',
    icon: 'search',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['search', 'find', 'filter', 'lookup'],
    defaultProps: {
      label: 'Search',
      placeholder: 'Search...',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto',
        color: '#000000',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'hidden-input',
    type: 'hidden',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Hidden Input',
    description: 'Hidden field for storing data',
    icon: 'eye-off',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['hidden', 'data', 'storage', 'invisible'],
    defaultProps: {
      label: 'Hidden Field',
      value: '',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        display: 'none'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: false,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'color-input',
    type: 'color',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Color Picker',
    description: 'Color selection input',
    icon: 'palette',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['color', 'picker', 'hex', 'rgb'],
    defaultProps: {
      label: 'Choose Color',
      value: '#000000',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'range-input',
    type: 'range',
    category: 'basic' as ComponentCategory,
    group: 'input' as ComponentGroup,
    label: 'Range Slider',
    description: 'Numeric range slider input',
    icon: 'sliders',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['range', 'slider', 'numeric', 'scale'],
    defaultProps: {
      label: 'Select Range',
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },

  // ==============================
  // SELECTION COMPONENTS (10)
  // ==============================
  {
    id: 'radio-group',
    type: 'radio',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Radio Group',
    description: 'Single choice from multiple options',
    icon: 'circle',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['radio', 'choice', 'single', 'option'],
    defaultProps: {
      label: 'Choose One Option',
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
      ],
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'checkbox-group',
    type: 'checkbox',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Checkbox Group',
    description: 'Multiple choice selection',
    icon: 'check-square',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['checkbox', 'multiple', 'choice', 'selection'],
    defaultProps: {
      label: 'Select All That Apply',
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
      ],
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'dropdown-select',
    type: 'dropdown',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Dropdown Select',
    description: 'Dropdown selection menu',
    icon: 'chevron-down',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['dropdown', 'select', 'menu', 'choice'],
    defaultProps: {
      label: 'Select an Option',
      placeholder: 'Choose...',
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
      ],
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'multi-select',
    type: 'multiselect',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Multi Select',
    description: 'Multiple selection dropdown',
    icon: 'list-checks',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['multi', 'select', 'multiple', 'dropdown'],
    defaultProps: {
      label: 'Select Multiple Options',
      placeholder: 'Choose multiple...',
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' }
      ],
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'toggle-switch',
    type: 'toggle',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Toggle Switch',
    description: 'On/off toggle switch',
    icon: 'toggle-left',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['toggle', 'switch', 'boolean', 'on', 'off'],
    defaultProps: {
      label: 'Toggle Option',
      value: false,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'yes-no-buttons',
    type: 'binary',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Yes/No Buttons',
    description: 'Binary choice buttons',
    icon: 'check-circle',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['yes', 'no', 'binary', 'buttons', 'choice'],
    defaultProps: {
      label: 'Yes or No?',
      yesLabel: 'Yes',
      noLabel: 'No',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'rating-stars',
    type: 'ratingstar',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Star Rating',
    description: 'Star-based rating system',
    icon: 'star',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['rating', 'stars', 'review', 'feedback'],
    defaultProps: {
      label: 'Rate Your Experience',
      maxStars: 5,
      allowHalf: false,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'rating-numbers',
    type: 'numberrating',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Number Rating',
    description: 'Numeric rating scale',
    icon: 'bar-chart-3',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['rating', 'numbers', 'scale', 'numeric'],
    defaultProps: {
      label: 'Rate from 1 to 10',
      minValue: 1,
      maxValue: 10,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'likert-scale',
    type: 'likert',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Likert Scale',
    description: 'Agreement scale rating',
    icon: 'trending-up',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['likert', 'scale', 'agreement', 'survey'],
    defaultProps: {
      label: 'Rate Your Agreement',
      scale: [
        'Strongly Disagree',
        'Disagree',
        'Neutral',
        'Agree',
        'Strongly Agree'
      ],
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'image-choice',
    type: 'imagechoice',
    category: 'selection' as ComponentCategory,
    group: 'selection' as ComponentGroup,
    label: 'Image Choice',
    description: 'Visual selection with images',
    icon: 'image',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['image', 'visual', 'choice', 'picture'],
    defaultProps: {
      label: 'Choose an Image',
      options: [
        { label: 'Option 1', value: 'option1', image: '/placeholder1.jpg' },
        { label: 'Option 2', value: 'option2', image: '/placeholder2.jpg' }
      ],
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },

  // ==============================
  // DATETIME COMPONENTS (6)
  // ==============================
  {
    id: 'date-picker',
    type: 'calendar',
    category: 'datetime' as ComponentCategory,
    group: 'date' as ComponentGroup,
    label: 'Date Picker',
    description: 'Calendar date selection',
    icon: 'calendar',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['date', 'calendar', 'picker', 'day'],
    defaultProps: {
      label: 'Select Date',
      placeholder: 'Choose a date',
      format: 'MM/DD/YYYY',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'time-picker',
    type: 'clock',
    category: 'datetime' as ComponentCategory,
    group: 'date' as ComponentGroup,
    label: 'Time Picker',
    description: 'Time selection input',
    icon: 'clock',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['time', 'clock', 'hour', 'minute'],
    defaultProps: {
      label: 'Select Time',
      placeholder: 'Choose time',
      format: '12h',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'datetime-picker',
    type: 'datetime',
    category: 'datetime' as ComponentCategory,
    group: 'date' as ComponentGroup,
    label: 'DateTime Picker',
    description: 'Date and time selection',
    icon: 'calendar-days',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['datetime', 'date', 'time', 'combined'],
    defaultProps: {
      label: 'Select Date & Time',
      placeholder: 'Choose date and time',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'date-range-picker',
    type: 'daterange',
    category: 'datetime' as ComponentCategory,
    group: 'date' as ComponentGroup,
    label: 'Date Range Picker',
    description: 'Start and end date selection',
    icon: 'calendar-range',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['date', 'range', 'start', 'end', 'period'],
    defaultProps: {
      label: 'Select Date Range',
      startPlaceholder: 'Start date',
      endPlaceholder: 'End date',
      format: 'MM/DD/YYYY',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'time-range-picker',
    type: 'timerange',
    category: 'datetime' as ComponentCategory,
    group: 'date' as ComponentGroup,
    label: 'Time Range Picker',
    description: 'Start and end time selection',
    icon: 'clock',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['time', 'range', 'start', 'end', 'duration'],
    defaultProps: {
      label: 'Select Time Range',
      startPlaceholder: 'Start time',
      endPlaceholder: 'End time',
      format: '12h',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'appointment-scheduler',
    type: 'appointment',
    category: 'datetime' as ComponentCategory,
    group: 'date' as ComponentGroup,
    label: 'Appointment Scheduler',
    description: 'Calendar-based appointment booking',
    icon: 'calendar-check',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['appointment', 'scheduler', 'booking', 'calendar'],
    defaultProps: {
      label: 'Book an Appointment',
      availableSlots: [],
      duration: 30,
      timezone: 'local',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },

  // ==============================
  // FILE/MEDIA COMPONENTS (5)
  // ==============================
  {
    id: 'file-upload-single',
    type: 'fileupload',
    category: 'file_media' as ComponentCategory,
    group: 'media' as ComponentGroup,
    label: 'File Upload Single',
    description: 'Single file upload',
    icon: 'upload',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['file', 'upload', 'single', 'attachment'],
    defaultProps: {
      label: 'Upload File',
      acceptedTypes: '*',
      maxSize: '10MB',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'file-upload-multiple',
    type: 'fileuploadmultiple',
    category: 'file_media' as ComponentCategory,
    group: 'media' as ComponentGroup,
    label: 'File Upload Multiple',
    description: 'Multiple file upload',
    icon: 'file-up',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['file', 'upload', 'multiple', 'batch'],
    defaultProps: {
      label: 'Upload Files',
      acceptedTypes: '*',
      maxSize: '10MB',
      maxFiles: 5,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'image-upload',
    type: 'imageupload',
    category: 'file_media' as ComponentCategory,
    group: 'media' as ComponentGroup,
    label: 'Image Upload',
    description: 'Image file upload with preview',
    icon: 'image-plus',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['image', 'upload', 'photo', 'picture'],
    defaultProps: {
      label: 'Upload Image',
      acceptedTypes: '.jpg,.jpeg,.png,.gif,.webp',
      maxSize: '5MB',
      showPreview: true,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'document-upload',
    type: 'documentupload',
    category: 'file_media' as ComponentCategory,
    group: 'media' as ComponentGroup,
    label: 'Document Upload',
    description: 'Document file upload',
    icon: 'file-image',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['document', 'upload', 'pdf', 'doc'],
    defaultProps: {
      label: 'Upload Document',
      acceptedTypes: '.pdf,.doc,.docx,.txt,.rtf',
      maxSize: '25MB',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'drag-drop-zone',
    type: 'dragdrop',
    category: 'file_media' as ComponentCategory,
    group: 'media' as ComponentGroup,
    label: 'Drag & Drop Zone',
    description: 'Drag and drop file upload area',
    icon: 'folder-open',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['drag', 'drop', 'zone', 'upload', 'file'],
    defaultProps: {
      label: 'Drag & Drop Files',
      acceptedTypes: '*',
      maxSize: '10MB',
      maxFiles: 10,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: '150px',
        border: '2px dashed #ccc'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },

  // ==============================
  // LAYOUT COMPONENTS (8)
  // ==============================
  {
    id: 'section-divider',
    type: 'divider',
    category: 'layout' as ComponentCategory,
    group: 'layout' as ComponentGroup,
    label: 'Section Divider',
    description: 'Visual section separator',
    icon: 'minus',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['section', 'divider', 'separator', 'line'],
    defaultProps: {
      label: '',
      style: 'solid',
      thickness: 1,
      color: '#ccc',
      margin: '20px 0',
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'page-break',
    type: 'pagebreak',
    category: 'layout' as ComponentCategory,
    group: 'layout' as ComponentGroup,
    label: 'Page Break',
    description: 'Force new page in multi-page forms',
    icon: 'book-open',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['page', 'break', 'new', 'multi'],
    defaultProps: {
      label: 'Page Break',
      showInPreview: true,
      styles: {
        width: '100%',
        height: '1px',
        background: 'transparent'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'section-collapse',
    type: 'collapse',
    category: 'layout' as ComponentCategory,
    group: 'layout' as ComponentGroup,
    label: 'Collapsible Section',
    description: 'Expandable/collapsible content section',
    icon: 'chevron-up',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['collapsible', 'expandable', 'section', 'accordion'],
    defaultProps: {
      label: 'Section Title',
      isOpen: false,
      children: [],
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'html-block',
    type: 'html',
    category: 'layout' as ComponentCategory,
    group: 'layout' as ComponentGroup,
    label: 'HTML Block',
    description: 'Custom HTML content block',
    icon: 'code',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['html', 'custom', 'code', 'content'],
    defaultProps: {
      label: 'HTML Content',
      content: '<p>Custom HTML content goes here</p>',
      sanitize: true,
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'heading-block',
    type: 'heading',
    category: 'layout' as ComponentCategory,
    group: 'layout' as ComponentGroup,
    label: 'Heading',
    description: 'Text heading element',
    icon: 'heading-1',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['heading', 'title', 'header', 'text'],
    defaultProps: {
      text: 'Heading Text',
      level: 2,
      alignment: 'left',
      styles: {
        width: '100%',
        height: 'auto',
        fontSize: '24px',
        fontWeight: 'bold'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'paragraph-block',
    type: 'paragraph',
    category: 'layout' as ComponentCategory,
    group: 'layout' as ComponentGroup,
    label: 'Paragraph',
    description: 'Text paragraph element',
    icon: 'align-left',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['paragraph', 'text', 'content', 'description'],
    defaultProps: {
      text: 'Paragraph text content goes here. You can add instructions, descriptions, or any other text content.',
      alignment: 'left',
      styles: {
        width: '100%',
        height: 'auto',
        fontSize: '14px',
        lineHeight: '1.5'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'spacer',
    type: 'spacer',
    category: 'layout' as ComponentCategory,
    group: 'layout' as ComponentGroup,
    label: 'Spacer',
    description: 'Empty space for layout control',
    icon: 'move',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['spacer', 'space', 'gap', 'layout'],
    defaultProps: {
      height: '20px',
      styles: {
        width: '100%',
        height: '20px',
        background: 'transparent'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'progress-bar',
    type: 'progress',
    category: 'layout' as ComponentCategory,
    group: 'layout' as ComponentGroup,
    label: 'Progress Bar',
    description: 'Form completion progress indicator',
    icon: 'bar-chart',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['progress', 'bar', 'completion', 'indicator'],
    defaultProps: {
      showPercentage: true,
      showSteps: false,
      color: '#007bff',
      styles: {
        width: '100%',
        height: '8px'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },

  // ==============================
  // ADVANCED COMPONENTS (6)
  // ==============================
  {
    id: 'signature-pad',
    type: 'signature',
    category: 'advanced' as ComponentCategory,
    group: 'advanced' as ComponentGroup,
    label: 'Signature Pad',
    description: 'Digital signature capture',
    icon: 'pen-tool',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['signature', 'sign', 'digital', 'capture'],
    defaultProps: {
      label: 'Your Signature',
      width: 400,
      height: 200,
      penColor: '#000',
      backgroundColor: '#fff',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto',
        border: '1px solid #ccc'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'location-picker',
    type: 'location',
    category: 'advanced' as ComponentCategory,
    group: 'advanced' as ComponentGroup,
    label: 'Location Picker',
    description: 'Interactive map location selection',
    icon: 'map-pin',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['location', 'map', 'gps', 'coordinates'],
    defaultProps: {
      label: 'Select Location',
      defaultZoom: 10,
      allowCurrentLocation: true,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: '300px'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'captcha',
    type: 'captcha',
    category: 'advanced' as ComponentCategory,
    group: 'advanced' as ComponentGroup,
    label: 'CAPTCHA',
    description: 'Bot protection verification',
    icon: 'shield',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['captcha', 'security', 'bot', 'verification'],
    defaultProps: {
      label: 'Verify you are human',
      type: 'recaptcha',
      siteKey: '',
      required: true,
      validation: {
        rules: ['required'],
        messages: {
          required: 'Please complete the CAPTCHA verification'
        }
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'matrix-grid',
    type: 'matrix',
    category: 'advanced' as ComponentCategory,
    group: 'advanced' as ComponentGroup,
    label: 'Matrix Grid',
    description: 'Grid-based question matrix',
    icon: 'grid-3x3',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['matrix', 'grid', 'table', 'survey'],
    defaultProps: {
      label: 'Matrix Question',
      rows: [
        { label: 'Question 1', value: 'q1' },
        { label: 'Question 2', value: 'q2' }
      ],
      columns: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' }
      ],
      inputType: 'radio',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'input-table',
    type: 'table',
    category: 'advanced' as ComponentCategory,
    group: 'advanced' as ComponentGroup,
    label: 'Input Table',
    description: 'Editable data table',
    icon: 'table',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['table', 'input', 'data', 'editable'],
    defaultProps: {
      label: 'Data Table',
      columns: [
        { label: 'Name', type: 'text', required: true },
        { label: 'Email', type: 'email', required: false },
        { label: 'Phone', type: 'tel', required: false }
      ],
      minRows: 1,
      maxRows: 10,
      allowAdd: true,
      allowDelete: true,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'qr-barcode-scanner',
    type: 'qrscanner',
    category: 'advanced' as ComponentCategory,
    group: 'advanced' as ComponentGroup,
    label: 'QR/Barcode Scanner',
    description: 'Camera-based code scanner',
    icon: 'qr-code',
    minPlan: 'ENTERPRISE' as PlanType,
    trialAllowed: false,
    searchTags: ['qr', 'barcode', 'scanner', 'camera'],
    defaultProps: {
      label: 'Scan Code',
      scanTypes: ['qr', 'barcode'],
      enableCamera: true,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: '300px'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },

  // ==============================
  // COMPOSITE COMPONENTS (4)
  // ==============================
  {
    id: 'full-name',
    type: 'fullname',
    category: 'composite' as ComponentCategory,
    group: 'composite' as ComponentGroup,
    label: 'Full Name',
    description: 'First and last name fields',
    icon: 'user',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['name', 'first', 'last', 'full'],
    defaultProps: {
      label: 'Full Name',
      showMiddleName: false,
      showPrefix: false,
      showSuffix: false,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'address',
    type: 'address',
    category: 'composite' as ComponentCategory,
    group: 'composite' as ComponentGroup,
    label: 'Address',
    description: 'Complete address form',
    icon: 'map-pinned',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['address', 'street', 'city', 'state', 'zip'],
    defaultProps: {
      label: 'Address',
      showStreet2: true,
      showCountry: true,
      defaultCountry: 'US',
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'contact-info',
    type: 'contactinfo',
    category: 'composite' as ComponentCategory,
    group: 'composite' as ComponentGroup,
    label: 'Contact Info',
    description: 'Email and phone contact fields',
    icon: 'users',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['contact', 'email', 'phone', 'info'],
    defaultProps: {
      label: 'Contact Information',
      showEmail: true,
      showPhone: true,
      showMobile: false,
      showFax: false,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'emergency-contact',
    type: 'emergencycontact',
    category: 'composite' as ComponentCategory,
    group: 'composite' as ComponentGroup,
    label: 'Emergency Contact',
    description: 'Emergency contact information form',
    icon: 'alert-triangle',
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    searchTags: ['emergency', 'contact', 'name', 'phone', 'relationship'],
    defaultProps: {
      label: 'Emergency Contact',
      showRelationship: true,
      showSecondary: false,
      required: false,
      validation: {
        rules: [],
        messages: {}
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },

  // ==============================
  // PAYMENT COMPONENTS (5)
  // ==============================
  {
    id: 'stripe-payment',
    type: 'stripe',
    category: 'payment' as ComponentCategory,
    group: 'payment' as ComponentGroup,
    label: 'Stripe Payment',
    description: 'Stripe payment processing',
    icon: 'credit-card',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['stripe', 'payment', 'credit', 'card'],
    defaultProps: {
      label: 'Payment Information',
      amount: 0,
      currency: 'USD',
      allowSaveCard: true,
      required: true,
      validation: {
        rules: ['required'],
        messages: {
          required: 'Payment information is required'
        }
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'paypal-payment',
    type: 'paypal',
    category: 'payment' as ComponentCategory,
    group: 'payment' as ComponentGroup,
    label: 'PayPal Payment',
    description: 'PayPal payment processing',
    icon: 'dollar-sign',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['paypal', 'payment', 'checkout'],
    defaultProps: {
      label: 'PayPal Payment',
      amount: 0,
      currency: 'USD',
      buttonStyle: 'blue',
      required: true,
      validation: {
        rules: ['required'],
        messages: {
          required: 'Payment is required'
        }
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'square-payment',
    type: 'square',
    category: 'payment' as ComponentCategory,
    group: 'payment' as ComponentGroup,
    label: 'Square Payment',
    description: 'Square payment processing',
    icon: 'wallet',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['square', 'payment', 'pos'],
    defaultProps: {
      label: 'Square Payment',
      amount: 0,
      currency: 'USD',
      applicationId: '',
      required: true,
      validation: {
        rules: ['required'],
        messages: {
          required: 'Payment is required'
        }
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'razorpay-payment',
    type: 'razorpay',
    category: 'payment' as ComponentCategory,
    group: 'payment' as ComponentGroup,
    label: 'Razorpay Payment',
    description: 'Razorpay payment processing',
    icon: 'building',
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    searchTags: ['razorpay', 'payment', 'india'],
    defaultProps: {
      label: 'Razorpay Payment',
      amount: 0,
      currency: 'INR',
      keyId: '',
      required: true,
      validation: {
        rules: ['required'],
        messages: {
          required: 'Payment is required'
        }
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  },
  {
    id: 'custom-payment',
    type: 'custompayment',
    category: 'payment' as ComponentCategory,
    group: 'payment' as ComponentGroup,
    label: 'Custom Payment',
    description: 'Custom payment integration',
    icon: 'credit-card',
    minPlan: 'ENTERPRISE' as PlanType,
    trialAllowed: false,
    searchTags: ['custom', 'payment', 'integration'],
    defaultProps: {
      label: 'Custom Payment',
      amount: 0,
      currency: 'USD',
      webhookUrl: '',
      required: true,
      validation: {
        rules: ['required'],
        messages: {
          required: 'Payment is required'
        }
      },
      styles: {
        width: '100%',
        height: 'auto'
      },
      advanced: {
        readOnly: false,
        disabled: false,
        visible: true,
        helpText: '',
        tooltip: ''
      }
    }
  }
];

// ===================================
// COMPONENT REGISTRY ASSEMBLY
// ===================================
export const traditionalComponentRegistry: ComponentRegistry = allComponents;

// ===================================
// HELPER FUNCTIONS
// ===================================

export const getComponentsByCategory = (category: ComponentCategory): ComponentDefinition[] => {
  return traditionalComponentRegistry.filter(comp => comp.category === category);
};

export const getComponentsByGroup = (group: ComponentGroup): ComponentDefinition[] => {
  return traditionalComponentRegistry.filter(comp => comp.group === group);
};

export const searchComponents = (query: string): ComponentDefinition[] => {
  const lowercaseQuery = query.toLowerCase();
  return traditionalComponentRegistry.filter(comp => 
    comp.label.toLowerCase().includes(lowercaseQuery) ||
    comp.description.toLowerCase().includes(lowercaseQuery) ||
    comp.searchTags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getComponentById = (id: string): ComponentDefinition | undefined => {
  return traditionalComponentRegistry.find(comp => comp.id === id);
};

export const getComponentByType = (type: string): ComponentDefinition | undefined => {
  return traditionalComponentRegistry.find(comp => comp.type === type);
};

export const validateComponentRegistry = (registry: ComponentDefinition[]): RegistryValidation => {
  const errors: string[] = [];
  const ids = new Set<string>();
  const types = new Set<string>();
  
  registry.forEach(component => {
    // Check for duplicate IDs
    if (ids.has(component.id)) {
      errors.push(`Duplicate component ID: ${component.id}`);
    }
    ids.add(component.id);
    
    // Check for duplicate types within same category
    const typeKey = `${component.category}-${component.type}`;
    if (types.has(typeKey)) {
      errors.push(`Duplicate component type in category: ${component.type} in ${component.category}`);
    }
    types.add(typeKey);
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getComponentStats = (): ComponentStats => {
  const total = traditionalComponentRegistry.length;
  const byPlan: Record<PlanType, number> = {
    FREE: traditionalComponentRegistry.filter(c => c.minPlan === 'FREE').length,
    PRO: traditionalComponentRegistry.filter(c => c.minPlan === 'PRO').length,
    ENTERPRISE: traditionalComponentRegistry.filter(c => c.minPlan === 'ENTERPRISE').length
  };
  const byCategory: Record<ComponentCategory, number> = {
    basic: traditionalComponentRegistry.filter(c => c.category === 'basic').length,
    selection: traditionalComponentRegistry.filter(c => c.category === 'selection').length,
    datetime: traditionalComponentRegistry.filter(c => c.category === 'datetime').length,
    file_media: traditionalComponentRegistry.filter(c => c.category === 'file_media').length,
    layout: traditionalComponentRegistry.filter(c => c.category === 'layout').length,
    advanced: traditionalComponentRegistry.filter(c => c.category === 'advanced').length,
    composite: traditionalComponentRegistry.filter(c => c.category === 'composite').length,
    payment: traditionalComponentRegistry.filter(c => c.category === 'payment').length
  };
  const byGroup: Record<ComponentGroup, number> = {
    input: traditionalComponentRegistry.filter(c => c.group === 'input').length,
    selection: traditionalComponentRegistry.filter(c => c.group === 'selection').length,
    date: traditionalComponentRegistry.filter(c => c.group === 'date').length,
    layout: traditionalComponentRegistry.filter(c => c.group === 'layout').length,
    media: traditionalComponentRegistry.filter(c => c.group === 'media').length,
    composite: traditionalComponentRegistry.filter(c => c.group === 'composite').length,
    payment: traditionalComponentRegistry.filter(c => c.group === 'payment').length,
    advanced: traditionalComponentRegistry.filter(c => c.group === 'advanced').length
  };

  return {
    total,
    byPlan,
    byCategory,
    byGroup
  };
};

export const getTraditionalRegistryMetadata = (): RegistryMetadata => {
  const stats = getComponentStats();
  const validation = validateComponentRegistry(traditionalComponentRegistry);
  
  return {
    version: '1.0.0',
    totalComponents: stats.total,
    lastUpdated: new Date().toISOString(),
    categories: Object.keys(stats.byCategory),
    groups: Object.keys(stats.byGroup),
    planTypes: ['FREE', 'PRO', 'ENTERPRISE'],
    recipeCategories: ['collect_info', 'make_choices', 'schedule_time', 'upload_files', 'organize_form', 'special_fields'],
    phase: 'Phase 1 - Traditional Components Complete',
    nextPhase: 'Phase 2 - Recipe Card Integration',
    notes: [
      `All ${stats.total} traditional components implemented`,
      'Proper category and group assignments',
      'Consistent icon mapping with Lucide React',
      'Plan restrictions properly configured',
      'Search tags optimized for discoverability',
      validation.isValid ? 'Registry validation passed' : `Registry validation failed: ${validation.errors.join(', ')}`
    ]
  };
};