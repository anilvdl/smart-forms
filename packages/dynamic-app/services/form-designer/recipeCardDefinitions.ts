// Recipe Card Definitions - Lazy Loaded Module
// User-friendly recipe card definitions for all components
import { 
  RecipeCardDefinition, 
  RecipeCategory, 
  RecipeCategoryInfo,
  ComponentDefinition,
  RecipeCardStats, 
  PlanType
} from './interfaces';

// ===================================
// RECIPE CARD DEFINITIONS
// ===================================
export const recipeCardDefinitions: Record<string, RecipeCardDefinition> = {
  'text-input': {
    friendlyName: 'Text Input',
    friendlyDescription: 'Collect any text information from users',
    category: 'collect_info' as const,
    preview: `Text Input
┌─────────────────────────────┐
│ Full Name                   │
│ [John Doe____________]      │
└─────────────────────────────┘`,
    useCase: 'Perfect for collecting names, titles, short descriptions, or any single-line text.',
    personas: {
      business: {
        example: 'Company name, job title, department'
      },
      healthcare: {
        example: 'Patient name, medical ID, referring physician'
      },
      educator: {
        example: 'Student name, parent name, course title'
      },
      enterprise: {
        example: 'Employee ID, project name, department'
      },
      casual: {
        example: 'Guest name, event title, feedback topic'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
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
  'email-input': {
    friendlyName: 'Email Input',
    friendlyDescription: 'Capture email addresses with built-in validation',
    category: 'collect_info' as const,
    preview: `Email Input
┌─────────────────────────────┐
│ Email Address               │
│ [john@example.com_______]   │
│ ✓ Valid email format        │
└─────────────────────────────┘`,
    useCase: 'Essential for contact forms, newsletters, account creation, and communication.',
    personas: {
      business: {
        example: 'Customer email for quotes, support tickets'
      },
      healthcare: {
        example: 'Patient contact, appointment confirmations'
      },
      educator: {
        example: 'Parent communication, student portals'
      },
      enterprise: {
        example: 'Employee contact, vendor communications'
      },
      casual: {
        example: 'Event RSVPs, newsletter signups'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Email Field',
      placeholder: 'Enter email...',
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
  'password-input': {
    friendlyName: 'Password Input',
    friendlyDescription: 'Secure password input with hidden characters',
    category: 'collect_info' as const,
    preview: `Password Input
┌─────────────────────────────┐
│ Password                    │
│ [••••••••••••••••••••••]    │
│ 👁 Show/Hide               │
└─────────────────────────────┘`,
    useCase: 'Required for user authentication, account creation, and secure access.',
    personas: {
      business: {
        example: 'Customer account creation, portal access'
      },
      healthcare: {
        example: 'Patient portal login, secure access'
      },
      educator: {
        example: 'Student account setup, parent portals'
      },
      enterprise: {
        example: 'Employee authentication, system access'
      },
      casual: {
        example: 'Event registration, member areas'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Password Field',
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
  'number-input': {
    friendlyName: 'Number Input',
    friendlyDescription: 'Collect numeric values with validation',
    category: 'collect_info' as const,
    preview: `Number Input
┌─────────────────────────────┐
│ Age                         │
│ [25___] years old           │
│ Min: 18  Max: 100           │
└─────────────────────────────┘`,
    useCase: 'Perfect for ages, quantities, prices, scores, or any numeric data.',
    personas: {
      business: {
        example: 'Order quantity, budget amount, years in business'
      },
      healthcare: {
        example: 'Patient age, weight, blood pressure readings'
      },
      educator: {
        example: 'Student grade, class size, test scores'
      },
      enterprise: {
        example: 'Employee count, project budget, timeline'
      },
      casual: {
        example: 'Guest count, event capacity, rating scores'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Number Field',
      placeholder: 'Enter number...',
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
  'phone-input': {
    friendlyName: 'Phone Input',
    friendlyDescription: 'Capture phone numbers with automatic formatting',
    category: 'collect_info' as const,
    preview: `Phone Input
┌─────────────────────────────┐
│ Phone Number                │
│ [(555) 123-4567_________]   │
│ 🇺🇸 +1                      │
└─────────────────────────────┘`,
    useCase: 'Essential for contact information, emergency contacts, and communication.',
    personas: {
      business: {
        example: 'Customer contact, sales follow-up calls'
      },
      healthcare: {
        example: 'Patient contact, emergency numbers'
      },
      educator: {
        example: 'Parent contact, emergency pickup person'
      },
      enterprise: {
        example: 'Employee contact, vendor phone numbers'
      },
      casual: {
        example: 'Event contact, delivery phone number'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Phone Field',
      placeholder: 'Enter phone...',
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
  'url-input': {
    friendlyName: 'URL Input',
    friendlyDescription: 'Collect website addresses with link validation',
    category: 'collect_info' as const,
    preview: `URL Input
┌─────────────────────────────┐
│ Website                     │
│ [https://example.com____]   │
│ 🔗 Valid URL format         │
└─────────────────────────────┘`,
    useCase: 'Great for collecting company websites, portfolios, social media links.',
    personas: {
      business: {
        example: 'Company website, LinkedIn profile, portfolio'
      },
      healthcare: {
        example: 'Referring physician website, medical records portal'
      },
      educator: {
        example: 'School website, student project links'
      },
      enterprise: {
        example: 'Vendor websites, partner company links'
      },
      casual: {
        example: 'Personal website, social media profiles'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'URL Field',
      placeholder: 'Enter URL...',
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
  'textarea': {
    friendlyName: 'Textarea',
    friendlyDescription: 'Collect longer text responses and detailed information',
    category: 'collect_info' as const,
    preview: `Textarea
┌─────────────────────────────┐
│ Comments                    │
│ ┌─────────────────────────┐ │
│ │ Please describe your    │ │
│ │ requirements in detail  │ │
│ │ here...                 │ │
│ │                         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘`,
    useCase: 'Perfect for comments, descriptions, feedback, or any detailed text input.',
    personas: {
      business: {
        example: 'Project requirements, customer feedback, notes'
      },
      healthcare: {
        example: 'Symptoms description, medical history, concerns'
      },
      educator: {
        example: 'Assignment descriptions, student feedback'
      },
      enterprise: {
        example: 'Project details, requirements, comments'
      },
      casual: {
        example: 'Event details, special requests, messages'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Textarea Field',
      placeholder: 'Enter textarea...',
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
  'rich-text': {
    friendlyName: 'Rich Text Editor',
    friendlyDescription: 'Formatted text input with styling options',
    category: 'collect_info' as const,
    preview: `Rich Text Editor
┌─────────────────────────────┐
│ [B] [I] [U] [🔗] [📄]       │
│ ┌─────────────────────────┐ │
│ │ **Bold text** and       │ │
│ │ *italic text* with      │ │
│ │ • Bullet points         │ │
│ │ • And formatting        │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘`,
    useCase: 'Ideal for formatted content, rich descriptions, and styled text input.',
    personas: {
      business: {
        example: 'Product descriptions, formatted proposals'
      },
      healthcare: {
        example: 'Detailed medical reports, treatment notes'
      },
      educator: {
        example: 'Assignment instructions, formatted content'
      },
      enterprise: {
        example: 'Documentation, formatted requirements'
      },
      casual: {
        example: 'Event descriptions, formatted announcements'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Rich Text Field',
      placeholder: 'Enter rich text...',
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
  'search-input': {
    friendlyName: 'Search Input',
    friendlyDescription: 'Search input with magnifying glass icon',
    category: 'collect_info' as const,
    preview: `Search Input
┌─────────────────────────────┐
│ 🔍 Search products...       │
│ [laptop computer________]   │
└─────────────────────────────┘`,
    useCase: 'Perfect for search functionality, filtering, and finding specific items.',
    personas: {
      business: {
        example: 'Product search, customer lookup, inventory'
      },
      healthcare: {
        example: 'Patient search, medication lookup, provider search'
      },
      educator: {
        example: 'Course search, student lookup, resource finder'
      },
      enterprise: {
        example: 'Employee search, document finder, system lookup'
      },
      casual: {
        example: 'Event search, guest lookup, activity finder'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Search Field',
      placeholder: 'Enter search...',
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
  'hidden-input': {
    friendlyName: 'Hidden Input',
    friendlyDescription: 'Store data invisibly for processing',
    category: 'collect_info' as const,
    preview: `Hidden Field
┌─────────────────────────────┐
│ (Hidden from user)          │
│ Stores: tracking_id=ABC123  │
│ Purpose: Data tracking      │
└─────────────────────────────┘`,
    useCase: 'Store tracking IDs, session data, or metadata invisible to users.',
    personas: {
      business: {
        example: 'Lead source tracking, campaign IDs, referrals'
      },
      healthcare: {
        example: 'Patient ID, form version, department codes'
      },
      educator: {
        example: 'Student ID, course code, semester tracking'
      },
      enterprise: {
        example: 'Employee ID, department code, system metadata'
      },
      casual: {
        example: 'Event ID, registration source, tracking data'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Hidden Field',
      placeholder: 'Enter hidden...',
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
  'color-input': {
    friendlyName: 'Color Input',
    friendlyDescription: 'Select colors with visual color picker',
    category: 'collect_info' as const,
    preview: `Color Picker
┌─────────────────────────────┐
│ Brand Color                 │
│ [🎨] #FF6600                │
│ ┌─────────┐                 │
│ │ ████████│ Orange          │
│ └─────────┘                 │
└─────────────────────────────┘`,
    useCase: 'Great for brand colors, theme selection, or any color preferences.',
    personas: {
      business: {
        example: 'Brand colors, logo colors, theme preferences'
      },
      healthcare: {
        example: 'Chart color coding, priority indicators'
      },
      educator: {
        example: 'Project themes, presentation colors'
      },
      enterprise: {
        example: 'Department colors, system themes, branding'
      },
      casual: {
        example: 'Event colors, decoration themes, preferences'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Color Field',
      placeholder: 'Enter color...',
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
  'range-input': {
    friendlyName: 'Range Input',
    friendlyDescription: 'Select numeric values with draggable slider',
    category: 'collect_info' as const,
    preview: `Range Slider
┌─────────────────────────────┐
│ Budget Range                │
│ $1,000  ●────────○  $10,000 │
│         ↑ $5,500            │
└─────────────────────────────┘`,
    useCase: 'Perfect for budgets, ratings, quantities, or any numeric range selection.',
    personas: {
      business: {
        example: 'Budget range, price range, quantity selection'
      },
      healthcare: {
        example: 'Pain scale, satisfaction rating, priority level'
      },
      educator: {
        example: 'Grade ranges, class size preferences'
      },
      enterprise: {
        example: 'Budget allocation, priority scaling, capacity'
      },
      casual: {
        example: 'Event size, budget range, preference scale'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Range Field',
      placeholder: 'Enter range...',
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
  'radio-group': {
    friendlyName: 'Radio Group',
    friendlyDescription: 'Choose one option from multiple choices',
    category: 'make_choices' as const,
    preview: `Radio Group
┌─────────────────────────────┐
│ Preferred Contact Method    │
│ ○ Email                     │
│ ● Phone                     │
│ ○ Text Message              │
└─────────────────────────────┘`,
    useCase: 'Perfect when users must choose exactly one option from a list.',
    personas: {
      business: {
        example: 'Service type, contact preference, payment method'
      },
      healthcare: {
        example: 'Insurance type, appointment type, preferred pharmacy'
      },
      educator: {
        example: 'Grade level, course preference, learning style'
      },
      enterprise: {
        example: 'Department, role type, access level'
      },
      casual: {
        example: 'Event type, meal preference, t-shirt size'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Radio Field',
      placeholder: 'Enter radio...',
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
  'checkbox-group': {
    friendlyName: 'Checkbox Group',
    friendlyDescription: 'Select multiple options from a list',
    category: 'make_choices' as const,
    preview: `Checkbox Group
┌─────────────────────────────┐
│ Services Interested In      │
│ ☑ Web Design               │
│ ☑ SEO                      │
│ ☐ Social Media             │
│ ☐ Content Writing          │
└─────────────────────────────┘`,
    useCase: 'Ideal when users can select multiple options from a list.',
    personas: {
      business: {
        example: 'Services needed, features wanted, interests'
      },
      healthcare: {
        example: 'Symptoms, medical conditions, medications'
      },
      educator: {
        example: 'Subjects of interest, extracurricular activities'
      },
      enterprise: {
        example: 'Skills, certifications, project involvement'
      },
      casual: {
        example: 'Event activities, dietary restrictions, interests'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Checkbox Field',
      placeholder: 'Enter checkbox...',
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
  'dropdown-select': {
    friendlyName: 'Dropdown Select',
    friendlyDescription: 'Space-saving dropdown selection',
    category: 'make_choices' as const,
    preview: `Dropdown Select
┌─────────────────────────────┐
│ Country                     │
│ [United States        ▼]    │
│   ├ United States           │
│   ├ Canada                  │
│   └ United Kingdom          │
└─────────────────────────────┘`,
    useCase: 'Great for long lists of options in a compact, organized format.',
    personas: {
      business: {
        example: 'Country selection, industry type, company size'
      },
      healthcare: {
        example: 'State selection, insurance provider, doctor specialty'
      },
      educator: {
        example: 'School district, grade level, course subject'
      },
      enterprise: {
        example: 'Department, location, job title'
      },
      casual: {
        example: 'State/province, event type, activity level'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Dropdown Field',
      placeholder: 'Enter dropdown...',
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
  'multi-select': {
    friendlyName: 'Multi Select',
    friendlyDescription: 'Dropdown allowing multiple selections',
    category: 'make_choices' as const,
    preview: `Multi-Select
┌─────────────────────────────┐
│ Skills (Select Multiple)    │
│ [JavaScript, React, No... ▼]│
│   ☑ JavaScript              │
│   ☑ React                   │
│   ☐ Vue.js                  │
│   ☑ Node.js                 │
└─────────────────────────────┘`,
    useCase: 'Perfect for selecting multiple items from longer lists efficiently.',
    personas: {
      business: {
        example: 'Skills, services, product categories, features'
      },
      healthcare: {
        example: 'Symptoms, allergies, medications, conditions'
      },
      educator: {
        example: 'Subjects taught, certifications, interests'
      },
      enterprise: {
        example: 'Technologies, skills, project types, roles'
      },
      casual: {
        example: 'Interests, activities, dietary preferences'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Multi Field',
      placeholder: 'Enter multi...',
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
  'toggle-switch': {
    friendlyName: 'Toggle Switch',
    friendlyDescription: 'Simple on/off or yes/no toggle',
    category: 'make_choices' as const,
    preview: `Toggle Switch
┌─────────────────────────────┐
│ Email Notifications         │
│ ●─────○ ON                  │
│                             │
│ SMS Alerts                  │
│ ○─────● OFF                 │
└─────────────────────────────┘`,
    useCase: 'Perfect for binary choices, preferences, and feature toggles.',
    personas: {
      business: {
        example: 'Newsletter signup, notifications, feature enables'
      },
      healthcare: {
        example: 'Consent forms, notifications, privacy settings'
      },
      educator: {
        example: 'Grade notifications, parent communications'
      },
      enterprise: {
        example: 'Feature access, notifications, permissions'
      },
      casual: {
        example: 'Event updates, reminders, communications'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Toggle Field',
      placeholder: 'Enter toggle...',
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
  'yes-no-buttons': {
    friendlyName: 'Yes No Buttons',
    friendlyDescription: 'Clear yes or no choice with buttons',
    category: 'make_choices' as const,
    preview: `Yes/No Buttons
┌─────────────────────────────┐
│ Are you 18 or older?        │
│                             │
│   [  YES  ]   [  NO  ]      │
│      ●          ○           │
└─────────────────────────────┘`,
    useCase: 'Clear binary decisions, agreements, confirmations, and eligibility.',
    personas: {
      business: {
        example: 'Terms agreement, age verification, consent'
      },
      healthcare: {
        example: 'Consent forms, health screening, allergies'
      },
      educator: {
        example: 'Permission forms, eligibility, agreements'
      },
      enterprise: {
        example: 'Policy agreements, access requests, confirmations'
      },
      casual: {
        example: 'RSVP responses, age verification, agreements'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Yes No Field',
      placeholder: 'Enter yes no...',
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
  'rating-stars': {
    friendlyName: 'Rating Stars',
    friendlyDescription: 'Collect ratings using star system',
    category: 'make_choices' as const,
    preview: `Star Rating
┌─────────────────────────────┐
│ Rate Your Experience        │
│                             │
│   ★ ★ ★ ★ ☆                 │
│   4 out of 5 stars          │
└─────────────────────────────┘`,
    useCase: 'Perfect for reviews, feedback, quality ratings, and satisfaction surveys.',
    personas: {
      business: {
        example: 'Service rating, product reviews, satisfaction'
      },
      healthcare: {
        example: 'Care quality, pain level, satisfaction rating'
      },
      educator: {
        example: 'Course rating, teacher evaluation, resource quality'
      },
      enterprise: {
        example: 'Performance rating, tool evaluation, satisfaction'
      },
      casual: {
        example: 'Event rating, experience feedback, recommendations'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Rating Field',
      placeholder: 'Enter rating...',
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
  'rating-numbers': {
    friendlyName: 'Rating Numbers',
    friendlyDescription: 'Numeric scale rating system',
    category: 'make_choices' as const,
    preview: `Number Rating
┌─────────────────────────────┐
│ Rate 1-10                   │
│                             │
│ [1][2][3][4][5][6][7][8][9][10]│
│           ● 7               │
└─────────────────────────────┘`,
    useCase: 'Numerical ratings, satisfaction scores, and precise scale measurements.',
    personas: {
      business: {
        example: 'Service rating 1-10, likelihood to recommend'
      },
      healthcare: {
        example: 'Pain scale 1-10, satisfaction rating'
      },
      educator: {
        example: 'Course difficulty 1-5, understanding level'
      },
      enterprise: {
        example: 'Performance scale 1-10, priority rating'
      },
      casual: {
        example: 'Event enjoyment 1-5, recommendation score'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Rating Field',
      placeholder: 'Enter rating...',
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
  'likert-scale': {
    friendlyName: 'Likert Scale',
    friendlyDescription: 'Agreement scale for measuring agreement levels',
    category: 'make_choices' as const,
    preview: `Likert Scale
┌─────────────────────────────┐
│ "The process was easy"      │
│                             │
│ [Strongly] [Disagree] [Neutral]│
│ [Disagree]           [Agree]│
│           [Strongly Agree]  │
│              ● Agree        │
└─────────────────────────────┘`,
    useCase: 'Measure agreement, satisfaction, and opinions on statements or services.',
    personas: {
      business: {
        example: 'Service satisfaction, process feedback, agreement'
      },
      healthcare: {
        example: 'Care satisfaction, treatment effectiveness'
      },
      educator: {
        example: 'Course satisfaction, teaching effectiveness'
      },
      enterprise: {
        example: 'Process satisfaction, tool effectiveness'
      },
      casual: {
        example: 'Event satisfaction, experience quality'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Likert Field',
      placeholder: 'Enter likert...',
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
  'image-choice': {
    friendlyName: 'Image Choice',
    friendlyDescription: 'Select options using images',
    category: 'make_choices' as const,
    preview: `Image Choice
┌─────────────────────────────┐
│ Choose Your Style           │
│                             │
│ [🏢 Modern] [🏛 Classic]     │
│     ●          ○            │
│ [🌿 Natural] [⚡ Bold]       │
│     ○          ○            │
└─────────────────────────────┘`,
    useCase: 'Visual selection for styles, products, designs, or image-based choices.',
    personas: {
      business: {
        example: 'Design style, product variants, logo options'
      },
      healthcare: {
        example: 'Symptom illustrations, treatment options'
      },
      educator: {
        example: 'Learning styles, project themes, visual preferences'
      },
      enterprise: {
        example: 'Design templates, brand styles, interface themes'
      },
      casual: {
        example: 'Event themes, decoration styles, activity types'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Image Field',
      placeholder: 'Enter image...',
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
  'date-picker': {
    friendlyName: 'Date Picker',
    friendlyDescription: 'Select specific dates with calendar',
    category: 'schedule_time' as const,
    preview: `Date Picker
┌─────────────────────────────┐
│ Appointment Date            │
│ [📅 12/15/2024        ▼]    │
│  ┌─ December 2024 ──────┐   │
│  │ Su Mo Tu We Th Fr Sa │   │
│  │ 1  2  3  4  5  6  7  │   │
│  │ 8  9 10 11 12 ●● 14 │   │
│  └─────────────────────┘   │
└─────────────────────────────┘`,
    useCase: 'Perfect for appointments, deadlines, event dates, and scheduling.',
    personas: {
      business: {
        example: 'Meeting dates, project deadlines, delivery dates'
      },
      healthcare: {
        example: 'Appointment scheduling, procedure dates, follow-ups'
      },
      educator: {
        example: 'Assignment due dates, exam dates, event scheduling'
      },
      enterprise: {
        example: 'Project milestones, meeting dates, deadline tracking'
      },
      casual: {
        example: 'Event dates, party planning, travel dates'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Date Field',
      placeholder: 'Enter date...',
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
  'time-picker': {
    friendlyName: 'Time Picker',
    friendlyDescription: 'Select specific times for scheduling',
    category: 'schedule_time' as const,
    preview: `Time Picker
┌─────────────────────────────┐
│ Appointment Time            │
│ [🕐 2:30 PM          ▼]     │
│  ┌─ Select Time ────────┐   │
│  │ Hour:  [02] ▼        │   │
│  │ Min:   [30] ▼        │   │
│  │ [AM] ● [PM]          │   │
│  └─────────────────────┘   │
└─────────────────────────────┘`,
    useCase: 'Time scheduling for appointments, meetings, and timed events.',
    personas: {
      business: {
        example: 'Meeting times, delivery windows, service appointments'
      },
      healthcare: {
        example: 'Appointment times, medication schedules, procedure times'
      },
      educator: {
        example: 'Class times, meeting schedules, event timing'
      },
      enterprise: {
        example: 'Meeting times, deadline times, shift scheduling'
      },
      casual: {
        example: 'Party start time, event scheduling, pickup times'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Time Field',
      placeholder: 'Enter time...',
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
  'datetime-picker': {
    friendlyName: 'DateTime Picker',
    friendlyDescription: 'Combined date and time selection',
    category: 'schedule_time' as const,
    preview: `DateTime Picker
┌─────────────────────────────┐
│ Event Date & Time           │
│ [📅 12/15/2024] [🕐 2:30 PM]│
│                             │
│ Selected: Dec 15, 2024      │
│          at 2:30 PM         │
└─────────────────────────────┘`,
    useCase: 'Complete scheduling with both date and time in one component.',
    personas: {
      business: {
        example: 'Event scheduling, meeting planning, deadline setting'
      },
      healthcare: {
        example: 'Appointment booking, procedure scheduling'
      },
      educator: {
        example: 'Assignment deadlines, exam scheduling, event planning'
      },
      enterprise: {
        example: 'Project deadlines, meeting scheduling, milestone setting'
      },
      casual: {
        example: 'Event planning, party scheduling, activity timing'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'DateTime Field',
      placeholder: 'Enter datetime...',
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
  'date-range-picker': {
    friendlyName: 'Date Range Picker',
    friendlyDescription: 'Select start and end dates for periods',
    category: 'schedule_time' as const,
    preview: `Date Range Picker
┌─────────────────────────────┐
│ Event Duration              │
│ From: [📅 12/15/2024]       │
│ To:   [📅 12/18/2024]       │
│                             │
│ Duration: 3 days            │
└─────────────────────────────┘`,
    useCase: 'Date ranges for events, projects, vacations, and time periods.',
    personas: {
      business: {
        example: 'Project timelines, campaign periods, service windows'
      },
      healthcare: {
        example: 'Treatment periods, recovery time, availability windows'
      },
      educator: {
        example: 'Semester dates, project periods, vacation schedules'
      },
      enterprise: {
        example: 'Project phases, budget periods, reporting timeframes'
      },
      casual: {
        example: 'Vacation dates, event duration, availability periods'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Date Range Field',
      placeholder: 'Enter date range...',
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
  'time-range-picker': {
    friendlyName: 'Time Range Picker',
    friendlyDescription: 'Select start and end times for duration',
    category: 'schedule_time' as const,
    preview: `Time Range Picker
┌─────────────────────────────┐
│ Available Hours             │
│ From: [🕐 9:00 AM ]         │
│ To:   [🕐 5:00 PM ]         │
│                             │
│ Duration: 8 hours           │
└─────────────────────────────┘`,
    useCase: 'Time ranges for availability, shifts, meeting durations, and time blocks.',
    personas: {
      business: {
        example: 'Business hours, meeting duration, service windows'
      },
      healthcare: {
        example: 'Shift times, appointment windows, availability hours'
      },
      educator: {
        example: 'Class periods, office hours, study time blocks'
      },
      enterprise: {
        example: 'Work shifts, meeting blocks, availability windows'
      },
      casual: {
        example: 'Event duration, activity times, availability hours'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Time Range Field',
      placeholder: 'Enter time range...',
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
  'appointment-scheduler': {
    friendlyName: 'Appointment Scheduler',
    friendlyDescription: 'Full calendar-based appointment scheduling',
    category: 'schedule_time' as const,
    preview: `Appointment Scheduler
┌─────────────────────────────┐
│ Book Appointment            │
│ ┌─ December 2024 ────────┐  │
│ │ Available Times:       │  │
│ │ ● 9:00 AM  ○ 10:30 AM │  │
│ │ ○ 2:00 PM  ● 3:30 PM  │  │
│ │ Duration: 30 minutes   │  │
│ └───────────────────────┘  │
└─────────────────────────────┘`,
    useCase: 'Complete appointment booking with availability management and calendar integration.',
    personas: {
      business: {
        example: 'Client consultations, service bookings, sales meetings'
      },
      healthcare: {
        example: 'Patient appointments, procedure scheduling, follow-ups'
      },
      educator: {
        example: 'Parent conferences, tutoring sessions, office hours'
      },
      enterprise: {
        example: 'Meeting scheduling, resource booking, interview slots'
      },
      casual: {
        example: 'Service appointments, consultation booking, event scheduling'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Appointment Field',
      placeholder: 'Enter appointment...',
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
  'file-upload-single': {
    friendlyName: 'File Upload Single',
    friendlyDescription: 'Upload single files with validation',
    category: 'upload_files' as const,
    preview: `File Upload Single
┌─────────────────────────────┐
│ Upload Resume               │
│ ┌─────────────────────────┐ │
│ │ [📄 Choose File...]     │ │
│ │ resume.pdf (2.1 MB)     │ │
│ │ ✓ Valid PDF format      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘`,
    useCase: 'Single file uploads for documents, resumes, certificates, and attachments.',
    personas: {
      business: {
        example: 'Contract uploads, proposal documents, certificates'
      },
      healthcare: {
        example: 'Medical records, insurance cards, prescription uploads'
      },
      educator: {
        example: 'Assignment submissions, transcripts, certificates'
      },
      enterprise: {
        example: 'Document uploads, reports, compliance files'
      },
      casual: {
        example: 'Photo uploads, document sharing, file attachments'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'File Field',
      placeholder: 'Enter file...',
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
  'file-upload-multiple': {
    friendlyName: 'File Upload Multiple',
    friendlyDescription: 'Upload multiple files at once',
    category: 'upload_files' as const,
    preview: `Multiple File Upload
┌─────────────────────────────┐
│ Upload Documents            │
│ [📁 Choose Files...]        │
│ ┌─────────────────────────┐ │
│ │ ✓ contract.pdf (1.2MB)  │ │
│ │ ✓ invoice.xlsx (0.8MB)  │ │
│ │ ✓ receipt.jpg (0.3MB)   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘`,
    useCase: 'Batch file uploads for multiple documents, images, or attachments.',
    personas: {
      business: {
        example: 'Multiple contracts, invoice batches, portfolio items'
      },
      healthcare: {
        example: 'Medical record batches, multiple test results'
      },
      educator: {
        example: 'Multiple assignment files, portfolio uploads'
      },
      enterprise: {
        example: 'Document batches, report collections, compliance files'
      },
      casual: {
        example: 'Photo albums, multiple documents, file collections'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'File Field',
      placeholder: 'Enter file...',
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
  'image-upload': {
    friendlyName: 'Image Upload',
    friendlyDescription: 'Upload images with preview functionality',
    category: 'upload_files' as const,
    preview: `Image Upload
┌─────────────────────────────┐
│ Profile Photo               │
│ ┌─────────────────────────┐ │
│ │ [🖼️ Upload Image...]    │ │
│ │ ┌─────────┐             │ │
│ │ │ [Photo] │ Remove      │ │
│ │ │ Preview │             │ │
│ │ └─────────┘             │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘`,
    useCase: 'Image uploads with preview for photos, logos, and visual content.',
    personas: {
      business: {
        example: 'Logo uploads, product photos, profile pictures'
      },
      healthcare: {
        example: 'Medical images, ID photos, insurance card photos'
      },
      educator: {
        example: 'Student photos, project images, visual assignments'
      },
      enterprise: {
        example: 'Employee photos, product images, visual assets'
      },
      casual: {
        example: 'Event photos, profile pictures, visual content'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Upload Field',
      placeholder: 'Enter upload...',
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
  'document-upload': {
    friendlyName: 'Document Upload',
    friendlyDescription: 'Upload documents with format validation',
    category: 'upload_files' as const,
    preview: `Document Upload
┌─────────────────────────────┐
│ Legal Documents             │
│ [📄 Upload Document...]     │
│ Accepted: PDF, DOC, DOCX    │
│ ┌─────────────────────────┐ │
│ │ 📄 contract.pdf         │ │
│ │ Size: 2.1MB ✓ Valid     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘`,
    useCase: 'Document uploads with type validation for PDFs, Word docs, and text files.',
    personas: {
      business: {
        example: 'Contracts, proposals, legal documents, reports'
      },
      healthcare: {
        example: 'Medical records, insurance documents, referrals'
      },
      educator: {
        example: 'Academic transcripts, assignments, certificates'
      },
      enterprise: {
        example: 'Business documents, compliance files, reports'
      },
      casual: {
        example: 'Personal documents, certificates, important files'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Document Field',
      placeholder: 'Enter document...',
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
  'drag-drop-zone': {
    friendlyName: 'Drag Drop Zone',
    friendlyDescription: 'Drag and drop file upload area',
    category: 'upload_files' as const,
    preview: `Drag & Drop Zone
┌─────────────────────────────┐
│ ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│ │                         │ │
│ │    📁 Drag files here   │ │
│ │                         │ │
│ │   or click to browse    │ │
│ │                         │ │
│ └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │
└─────────────────────────────┘`,
    useCase: 'User-friendly drag and drop interface for multiple file uploads.',
    personas: {
      business: {
        example: 'Bulk document uploads, file collections, media uploads'
      },
      healthcare: {
        example: 'Multiple medical files, batch document uploads'
      },
      educator: {
        example: 'Assignment collections, resource uploads, media files'
      },
      enterprise: {
        example: 'Project files, document batches, resource uploads'
      },
      casual: {
        example: 'Photo collections, file sharing, bulk uploads'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Drag Field',
      placeholder: 'Enter drag...',
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
  'section-divider': {
    friendlyName: 'Section Divider',
    friendlyDescription: 'Visual separator between form sections',
    category: 'organize_form' as const,
    preview: `Section Divider
┌─────────────────────────────┐
│ Personal Information        │
│ ─────────────────────────── │
│                             │
│ Contact Details             │
│ ─────────────────────────── │
└─────────────────────────────┘`,
    useCase: 'Organize forms into clear sections for better user experience.',
    personas: {
      business: {
        example: 'Separate billing/shipping, divide service sections'
      },
      healthcare: {
        example: 'Separate personal/medical info, insurance sections'
      },
      educator: {
        example: 'Divide student/parent info, separate course sections'
      },
      enterprise: {
        example: 'Organize by departments, separate project phases'
      },
      casual: {
        example: 'Separate event/personal info, organize by topics'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Section Field',
      placeholder: 'Enter section...',
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
  'page-break': {
    friendlyName: 'Page Break',
    friendlyDescription: 'Break long forms into multiple pages',
    category: 'organize_form' as const,
    preview: `Page Break
┌─────────────────────────────┐
│ ═══ Page 1 Complete ═══     │
│                             │
│    [Continue to Page 2]     │
│                             │
│ Progress: ████░░░░ 50%      │
└─────────────────────────────┘`,
    useCase: 'Split long forms into manageable pages for better completion rates.',
    personas: {
      business: {
        example: 'Multi-step applications, complex service forms'
      },
      healthcare: {
        example: 'Patient intake forms, comprehensive health surveys'
      },
      educator: {
        example: 'Student registration, detailed application forms'
      },
      enterprise: {
        example: 'Employee onboarding, detailed project forms'
      },
      casual: {
        example: 'Event registration, detailed signup forms'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Page Field',
      placeholder: 'Enter page...',
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
  'section-collapse': {
    friendlyName: 'Section Collapse',
    friendlyDescription: 'Expandable sections to reduce form length',
    category: 'organize_form' as const,
    preview: `Collapsible Section
┌─────────────────────────────┐
│ ▼ Additional Information    │
│   ┌─────────────────────┐   │
│   │ Optional fields     │   │
│   │ shown when expanded │   │
│   └─────────────────────┘   │
│ ▶ Emergency Contact Info    │
└─────────────────────────────┘`,
    useCase: 'Hide optional or advanced sections to simplify form appearance.',
    personas: {
      business: {
        example: 'Optional services, advanced settings, additional details'
      },
      healthcare: {
        example: 'Optional medical history, emergency contacts'
      },
      educator: {
        example: 'Optional parent info, additional course details'
      },
      enterprise: {
        example: 'Advanced options, optional certifications'
      },
      casual: {
        example: 'Optional event details, additional preferences'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Section Field',
      placeholder: 'Enter section...',
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
  'html-block': {
    friendlyName: 'HTML Block',
    friendlyDescription: 'Custom HTML content and formatting',
    category: 'organize_form' as const,
    preview: `HTML Block
┌─────────────────────────────┐
│ <h3>Terms & Conditions</h3> │
│ <p>Please read the following│
│ terms carefully before      │
│ proceeding with your        │
│ <strong>application</strong>│
│ </p>                        │
└─────────────────────────────┘`,
    useCase: 'Add custom content, terms, instructions, or formatted text.',
    personas: {
      business: {
        example: 'Terms of service, custom instructions, branding'
      },
      healthcare: {
        example: 'Privacy notices, medical disclaimers, instructions'
      },
      educator: {
        example: 'Course descriptions, assignment instructions'
      },
      enterprise: {
        example: 'Policy text, custom instructions, disclaimers'
      },
      casual: {
        example: 'Event details, custom instructions, formatting'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'HTML Field',
      placeholder: 'Enter HTML...',
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
  'heading-block': {
    friendlyName: 'Heading Block',
    friendlyDescription: 'Add headings and titles to forms',
    category: 'organize_form' as const,
    preview: `Heading Block
┌─────────────────────────────┐
│                             │
│   Personal Information      │
│  ═══════════════════════    │
│                             │
│   Contact Details           │
│  ─────────────────────       │
└─────────────────────────────┘`,
    useCase: 'Create clear section headers and form titles for organization.',
    personas: {
      business: {
        example: 'Section titles, form headers, step indicators'
      },
      healthcare: {
        example: 'Medical form sections, patient info headers'
      },
      educator: {
        example: 'Course sections, application form headers'
      },
      enterprise: {
        example: 'Department sections, project phase headers'
      },
      casual: {
        example: 'Event form sections, information headers'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Block Field',
      placeholder: 'Enter block...',
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
  'paragraph-block': {
    friendlyName: 'Paragraph Block',
    friendlyDescription: 'Add descriptive text and instructions',
    category: 'organize_form' as const,
    preview: `Paragraph Block
┌─────────────────────────────┐
│ Please provide accurate     │
│ information in all fields.  │
│ This data will be used to   │
│ process your application    │
│ and contact you regarding   │
│ next steps.                 │
└─────────────────────────────┘`,
    useCase: 'Provide instructions, descriptions, and helpful context for users.',
    personas: {
      business: {
        example: 'Process explanations, next steps, contact info'
      },
      healthcare: {
        example: 'Form instructions, privacy notices, disclaimers'
      },
      educator: {
        example: 'Application instructions, requirement explanations'
      },
      enterprise: {
        example: 'Policy explanations, process descriptions'
      },
      casual: {
        example: 'Event descriptions, helpful instructions'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Block Field',
      placeholder: 'Enter block...',
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
  'spacer': {
    friendlyName: 'Spacer',
    friendlyDescription: 'Add spacing between form elements',
    category: 'organize_form' as const,
    preview: `Spacer
┌─────────────────────────────┐
│ Form Element Above          │
│                             │
│ ░░░░░ Empty Space ░░░░░     │
│                             │
│ Form Element Below          │
└─────────────────────────────┘`,
    useCase: 'Control spacing and layout for better visual form organization.',
    personas: {
      business: {
        example: 'Separate form sections, improve visual layout'
      },
      healthcare: {
        example: 'Space between medical sections, visual breathing room'
      },
      educator: {
        example: 'Separate student/parent sections, improve readability'
      },
      enterprise: {
        example: 'Organize form layout, separate logical sections'
      },
      casual: {
        example: 'Improve form appearance, separate content areas'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Spacer Field',
      placeholder: 'Enter spacer...',
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
  'progress-bar': {
    friendlyName: 'Progress Bar',
    friendlyDescription: 'Show form completion progress',
    category: 'organize_form' as const,
    preview: `Progress Bar
┌─────────────────────────────┐
│ Form Progress               │
│ ████████░░░░░░░░ 60%        │
│ Step 3 of 5                 │
│                             │
│ Next: Contact Information   │
└─────────────────────────────┘`,
    useCase: 'Show users their progress through multi-step forms.',
    personas: {
      business: {
        example: 'Application progress, service setup steps'
      },
      healthcare: {
        example: 'Patient intake progress, registration steps'
      },
      educator: {
        example: 'Student registration progress, application steps'
      },
      enterprise: {
        example: 'Employee onboarding progress, project setup'
      },
      casual: {
        example: 'Event registration progress, signup steps'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Progress Field',
      placeholder: 'Enter progress...',
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
  'signature-pad': {
    friendlyName: 'Signature Pad',
    friendlyDescription: 'Capture digital signatures',
    category: 'special_fields' as const,
    preview: `Signature Pad
┌─────────────────────────────┐
│ Please Sign Below           │
│ ┌─────────────────────────┐ │
│ │ ~~~~~~~~~~~~~~~~        │ │
│ │   John Doe             │ │
│ │ ~~~~~~~~~~~~~~~~        │ │
│ └─────────────────────────┘ │
│ [Clear] [Done]              │
└─────────────────────────────┘`,
    useCase: 'Legal signatures, agreements, consent forms, and digital signing.',
    personas: {
      business: {
        example: 'Contract signing, service agreements, approvals'
      },
      healthcare: {
        example: 'Consent forms, treatment agreements, HIPAA forms'
      },
      educator: {
        example: 'Parent consent, field trip permissions, agreements'
      },
      enterprise: {
        example: 'Policy agreements, approval signatures, contracts'
      },
      casual: {
        example: 'Event waivers, agreement forms, consent signatures'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Signature Field',
      placeholder: 'Enter signature...',
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
  'location-picker': {
    friendlyName: 'Location Picker',
    friendlyDescription: 'Interactive map for location selection',
    category: 'special_fields' as const,
    preview: `Location Picker
┌─────────────────────────────┐
│ Select Location             │
│ ┌─────────────────────────┐ │
│ │ ░░░░░[📍]░░░░░░░░░░░░░░ │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░ │ │
│ │ ░░░░░░░░[🏢]░░░░░░░░░░░ │ │
│ └─────────────────────────┘ │
│ 📍 123 Main St, City, ST    │
└─────────────────────────────┘`,
    useCase: 'Location selection for addresses, meeting points, and geographic data.',
    personas: {
      business: {
        example: 'Service locations, delivery addresses, office locations'
      },
      healthcare: {
        example: 'Patient address verification, facility locations'
      },
      educator: {
        example: 'School locations, field trip destinations, addresses'
      },
      enterprise: {
        example: 'Office locations, meeting venues, project sites'
      },
      casual: {
        example: 'Event venues, party locations, meeting spots'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Location Field',
      placeholder: 'Enter location...',
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
  'captcha': {
    friendlyName: 'Captcha',
    friendlyDescription: 'Anti-bot verification for security',
    category: 'special_fields' as const,
    preview: `CAPTCHA
┌─────────────────────────────┐
│ Security Verification       │
│ ┌─────────────────────────┐ │
│ │ ☑ I'm not a robot       │ │
│ │     reCAPTCHA           │ │
│ └─────────────────────────┘ │
│ Complete to continue        │
└─────────────────────────────┘`,
    useCase: 'Prevent spam, protect forms from bots, and ensure human verification.',
    personas: {
      business: {
        example: 'Contact forms, lead generation, account creation'
      },
      healthcare: {
        example: 'Patient portals, appointment booking, secure forms'
      },
      educator: {
        example: 'Student registration, course signup, secure submissions'
      },
      enterprise: {
        example: 'Job applications, secure forms, access requests'
      },
      casual: {
        example: 'Event registration, contact forms, newsletter signup'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Captcha Field',
      placeholder: 'Enter captcha...',
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
  'matrix-grid': {
    friendlyName: 'Matrix Grid',
    friendlyDescription: 'Grid-based survey questions',
    category: 'special_fields' as const,
    preview: `Matrix Grid
┌─────────────────────────────┐
│ Rate Each Service           │
│                Poor    Excellent│
│ Support        ○ ○ ● ○ ○   │
│ Quality        ○ ● ○ ○ ○   │
│ Speed          ● ○ ○ ○ ○   │
│ Value          ○ ○ ○ ● ○   │
└─────────────────────────────┘`,
    useCase: 'Surveys, evaluations, and rating multiple items on same scale.',
    personas: {
      business: {
        example: 'Service evaluations, product ratings, satisfaction surveys'
      },
      healthcare: {
        example: 'Symptom assessments, care quality ratings'
      },
      educator: {
        example: 'Course evaluations, teacher assessments, skill ratings'
      },
      enterprise: {
        example: 'Performance reviews, tool evaluations, process ratings'
      },
      casual: {
        example: 'Event feedback, experience ratings, preference surveys'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Matrix Field',
      placeholder: 'Enter matrix...',
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
  'input-table': {
    friendlyName: 'Input Table',
    friendlyDescription: 'Editable table for structured data entry',
    category: 'special_fields' as const,
    preview: `Input Table
┌─────────────────────────────┐
│ Team Members                │
│ ┌─────┬─────────┬─────────┐ │
│ │Name │ Email   │ Role    │ │
│ ├─────┼─────────┼─────────┤ │
│ │John │john@..  │Manager  │ │
│ │Jane │jane@..  │Developer│ │
│ │[+]  │         │         │ │
│ └─────┴─────────┴─────────┘ │
└─────────────────────────────┘`,
    useCase: 'Collect structured data like team members, inventory, or tabular information.',
    personas: {
      business: {
        example: 'Team rosters, inventory lists, contact collections'
      },
      healthcare: {
        example: 'Medication lists, family member info, treatment history'
      },
      educator: {
        example: 'Student lists, course schedules, grade tracking'
      },
      enterprise: {
        example: 'Employee rosters, project teams, resource lists'
      },
      casual: {
        example: 'Guest lists, activity schedules, participant info'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Input Field',
      placeholder: 'Enter input...',
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
  'qr-barcode-scanner': {
    friendlyName: 'QR Barcode Scanner',
    friendlyDescription: 'Camera-based code scanning',
    category: 'special_fields' as const,
    preview: `QR Scanner
┌─────────────────────────────┐
│ Scan QR Code                │
│ ┌─────────────────────────┐ │
│ │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐   │ │
│ │ └─┘ └─┘ └─┘ └─┘ └─┘   │ │
│ │   📷 Point camera here  │ │
│ │ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐   │ │
│ │ └─┘ └─┘ └─┘ └─┘ └─┘   │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘`,
    useCase: 'Scan QR codes, barcodes for inventory, tickets, or product identification.',
    personas: {
      business: {
        example: 'Product scanning, inventory tracking, ticket validation'
      },
      healthcare: {
        example: 'Patient ID scanning, medication verification'
      },
      educator: {
        example: 'Student ID scanning, resource tracking, attendance'
      },
      enterprise: {
        example: 'Asset tracking, inventory management, access codes'
      },
      casual: {
        example: 'Event ticket scanning, product lookup, code validation'
      }
    },
    minPlan: 'ENTERPRISE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Scanner Field',
      placeholder: 'Enter scanner...',
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
  'full-name': {
    friendlyName: 'Full Name',
    friendlyDescription: 'Complete name collection with multiple fields',
    category: 'collect_info' as const,
    preview: `Full Name
┌─────────────────────────────┐
│ Name                        │
│ [First____] [Last_______]   │
│ [John_____] [Doe________]   │
└─────────────────────────────┘`,
    useCase: 'Comprehensive name collection for formal records and identification.',
    personas: {
      business: {
        example: 'Customer registration, contact forms, contracts'
      },
      healthcare: {
        example: 'Patient registration, insurance forms, records'
      },
      educator: {
        example: 'Student enrollment, parent information'
      },
      enterprise: {
        example: 'Employee records, vendor contacts, partners'
      },
      casual: {
        example: 'Event registration, membership signup'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Full Field',
      placeholder: 'Enter full...',
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
  'address': {
    friendlyName: 'Address',
    friendlyDescription: 'Complete address collection with all fields',
    category: 'collect_info' as const,
    preview: `Address
┌─────────────────────────────┐
│ Address                     │
│ [123 Main Street________]   │
│ [Apt 2B_] [New York____]    │
│ [NY] [10001] [🇺🇸 USA]      │
└─────────────────────────────┘`,
    useCase: 'Complete address collection for shipping, billing, and location data.',
    personas: {
      business: {
        example: 'Shipping address, billing address, office location'
      },
      healthcare: {
        example: 'Patient address, emergency contact address'
      },
      educator: {
        example: 'Student address, parent address, school address'
      },
      enterprise: {
        example: 'Employee address, vendor address, office address'
      },
      casual: {
        example: 'Event address, delivery address, mailing address'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Address Field',
      placeholder: 'Enter address...',
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
  'contact-info': {
    friendlyName: 'Contact Info',
    friendlyDescription: 'Email and phone contact details together',
    category: 'collect_info' as const,
    preview: `Contact Info
┌─────────────────────────────┐
│ Contact Information         │
│ [john@example.com_______]   │
│ [(555) 123-4567_________]   │
│ [555-987-6543___] Mobile    │
└─────────────────────────────┘`,
    useCase: 'Combined contact collection for comprehensive communication options.',
    personas: {
      business: {
        example: 'Customer contact, vendor information, support contacts'
      },
      healthcare: {
        example: 'Patient contact, emergency contact, provider info'
      },
      educator: {
        example: 'Parent contact, student contact, teacher info'
      },
      enterprise: {
        example: 'Employee contact, vendor contact, partner info'
      },
      casual: {
        example: 'Guest contact, event organizer, attendee info'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Contact Field',
      placeholder: 'Enter contact...',
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
  'emergency-contact': {
    friendlyName: 'Emergency Contact',
    friendlyDescription: 'Emergency contact person with relationship details',
    category: 'collect_info' as const,
    preview: `Emergency Contact
┌─────────────────────────────┐
│ Emergency Contact           │
│ [Jane Doe___] [Spouse___]   │
│ [(555) 987-6543_________]   │
│ [jane@email.com_________]   │
└─────────────────────────────┘`,
    useCase: 'Critical emergency contact information with relationship details.',
    personas: {
      business: {
        example: 'Employee emergency contact, contractor safety contact'
      },
      healthcare: {
        example: 'Patient emergency contact, next of kin information'
      },
      educator: {
        example: 'Student emergency contact, authorized pickup person'
      },
      enterprise: {
        example: 'Employee emergency contact, travel safety contact'
      },
      casual: {
        example: 'Event emergency contact, activity safety contact'
      }
    },
    minPlan: 'FREE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Emergency Field',
      placeholder: 'Enter emergency...',
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
  'stripe-payment': {
    friendlyName: 'Stripe Payment',
    friendlyDescription: 'Secure credit card processing via Stripe',
    category: 'special_fields' as const,
    preview: `Stripe Payment
┌─────────────────────────────┐
│ Payment Information         │
│ [4532 1234 5678 9012]       │
│ [12/25] [123] [John Doe]    │
│ ┌─────────────────────────┐ │
│ │ 🔒 Secured by Stripe    │ │
│ └─────────────────────────┘ │
│ Total: $99.99               │
└─────────────────────────────┘`,
    useCase: 'Secure online payments for products, services, and transactions.',
    personas: {
      business: {
        example: 'Service payments, product purchases, invoicing'
      },
      healthcare: {
        example: 'Copay collection, service fees, appointment payments'
      },
      educator: {
        example: 'Course fees, registration payments, resource purchases'
      },
      enterprise: {
        example: 'Service payments, subscription fees, transaction processing'
      },
      casual: {
        example: 'Event tickets, donation collection, service payments'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Stripe Field',
      placeholder: 'Enter stripe...',
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
  'paypal-payment': {
    friendlyName: 'PayPal Payment',
    friendlyDescription: 'PayPal checkout and payment processing',
    category: 'special_fields' as const,
    preview: `PayPal Payment
┌─────────────────────────────┐
│ PayPal Checkout             │
│ ┌─────────────────────────┐ │
│ │ [💳 Pay with PayPal]    │ │
│ │                         │ │
│ │ or pay with card        │ │
│ │ [💰 Pay $99.99]         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘`,
    useCase: 'Alternative payment method for users preferring PayPal.',
    personas: {
      business: {
        example: 'E-commerce payments, service fees, international transactions'
      },
      healthcare: {
        example: 'Patient payments, service fees, flexible payment options'
      },
      educator: {
        example: 'Tuition payments, course fees, donation collection'
      },
      enterprise: {
        example: 'Invoice payments, subscription fees, vendor payments'
      },
      casual: {
        example: 'Event payments, fundraising, donation collection'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Paypal Field',
      placeholder: 'Enter paypal...',
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
  'square-payment': {
    friendlyName: 'Square Payment',
    friendlyDescription: 'Square payment processing for businesses',
    category: 'special_fields' as const,
    preview: `Square Payment
┌─────────────────────────────┐
│ Square Checkout             │
│ ┌─────────────────────────┐ │
│ │ Card Number             │ │
│ │ [1234 5678 9012 3456]   │ │
│ │ [MM/YY] [CVV]           │ │
│ │ 🔒 Secure Payment       │ │
│ └─────────────────────────┘ │
│ Total: $99.99               │
└─────────────────────────────┘`,
    useCase: 'Square-integrated payments for retail and service businesses.',
    personas: {
      business: {
        example: 'Retail payments, POS integration, service transactions'
      },
      healthcare: {
        example: 'Practice payments, appointment fees, copay collection'
      },
      educator: {
        example: 'School payments, activity fees, fundraising'
      },
      enterprise: {
        example: 'Business payments, invoice processing, transactions'
      },
      casual: {
        example: 'Local business payments, service fees, transactions'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Square Field',
      placeholder: 'Enter square...',
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
  'razorpay-payment': {
    friendlyName: 'Razorpay Payment',
    friendlyDescription: 'Razorpay payment processing for India',
    category: 'special_fields' as const,
    preview: `Razorpay Payment
┌─────────────────────────────┐
│ Razorpay Checkout           │
│ ┌─────────────────────────┐ │
│ │ UPI ID / Card / Wallet  │ │
│ │ [💳] [📱] [💰]          │ │
│ │ Multiple payment options│ │
│ │ 🔒 Secured by Razorpay  │ │
│ └─────────────────────────┘ │
│ Amount: ₹7,999              │
└─────────────────────────────┘`,
    useCase: 'Indian payment processing with UPI, cards, and digital wallets.',
    personas: {
      business: {
        example: 'Indian market payments, UPI transactions, e-commerce'
      },
      healthcare: {
        example: 'Healthcare payments in India, consultation fees'
      },
      educator: {
        example: 'Educational fees, course payments, tuition collection'
      },
      enterprise: {
        example: 'B2B payments in India, invoice processing'
      },
      casual: {
        example: 'Event payments, service fees, local transactions'
      }
    },
    minPlan: 'PRO' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Razorpay Field',
      placeholder: 'Enter razorpay...',
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
  'custom-payment': {
    friendlyName: 'Custom Payment',
    friendlyDescription: 'Custom payment gateway integration',
    category: 'special_fields' as const,
    preview: `Custom Payment
┌─────────────────────────────┐
│ Payment Gateway             │
│ ┌─────────────────────────┐ │
│ │ Custom Integration      │ │
│ │ [Configure Gateway...]  │ │
│ │                         │ │
│ │ 🔒 Secure Processing    │ │
│ └─────────────────────────┘ │
│ Amount: $99.99              │
└─────────────────────────────┘`,
    useCase: 'Custom payment gateway integrations for specific business needs.',
    personas: {
      business: {
        example: 'Custom gateway integration, specific payment processors'
      },
      healthcare: {
        example: 'Healthcare-specific payment processing, compliance requirements'
      },
      educator: {
        example: 'Educational payment systems, institution-specific gateways'
      },
      enterprise: {
        example: 'Enterprise payment solutions, custom processing workflows'
      },
      casual: {
        example: 'Specialized payment needs, custom integration requirements'
      }
    },
    minPlan: 'ENTERPRISE' as PlanType,
    trialAllowed: false,
    defaultProps: {
      label: 'Custom Field',
      placeholder: 'Enter custom...',
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
  }
};

// ===================================
// RECIPE CATEGORY METADATA
// ===================================
export const recipeCategoryInfo: RecipeCategoryInfo[] = [
  { 
    id: 'collect_info', 
    label: 'Collect Information', 
    icon: 'user',
    description: 'Gather details like names, emails, and contact info'
  },
  { 
    id: 'make_choices', 
    label: 'Let Them Choose', 
    icon: 'check-square',
    description: 'Multiple choice, ratings, and selection fields'
  },
  { 
    id: 'schedule_time', 
    label: 'Schedule Time', 
    icon: 'calendar',
    description: 'Date pickers, time slots, and appointment booking'
  },
  { 
    id: 'upload_files', 
    label: 'Upload Files', 
    icon: 'upload',
    description: 'Documents, images, and file attachments'
  },
  { 
    id: 'organize_form', 
    label: 'Organize Your Form', 
    icon: 'layers',
    description: 'Sections, dividers, and layout elements'
  },
  { 
    id: 'special_fields', 
    label: 'Special Fields', 
    icon: 'star',
    description: 'Advanced features like signatures, payments, and scanning'
  }
];

// ===================================
// RECIPE CARD UTILITY FUNCTIONS
// ===================================

// Validate that all components have recipe cards
export const validateRecipeCards = (registry: ComponentDefinition[]): RecipeCardStats => {
  const componentsWithoutRecipeCards = registry.filter(comp => 
    !recipeCardDefinitions[comp.id]
  );
  
  const paymentComponents = registry.filter(comp => comp.category === 'payment');
  
  const byCategory = {
    collect_info: Object.values(recipeCardDefinitions).filter(card => card.category === 'collect_info').length,
    make_choices: Object.values(recipeCardDefinitions).filter(card => card.category === 'make_choices').length,
    schedule_time: Object.values(recipeCardDefinitions).filter(card => card.category === 'schedule_time').length,
    upload_files: Object.values(recipeCardDefinitions).filter(card => card.category === 'upload_files').length,
    organize_form: Object.values(recipeCardDefinitions).filter(card => card.category === 'organize_form').length,
    special_fields: Object.values(recipeCardDefinitions).filter(card => card.category === 'special_fields').length
  };

  const totalCards = Object.keys(recipeCardDefinitions).length;
  const withCards = registry.length - componentsWithoutRecipeCards.length;

  return {
    total: registry.length,
    withRecipeCards: withCards,
    withoutRecipeCards: componentsWithoutRecipeCards.length,
    paymentPlaceholders: paymentComponents.length,
    missingRecipeCards: componentsWithoutRecipeCards.map(comp => comp.id),
    isComplete: componentsWithoutRecipeCards.length === 0,
    byCategory,
    categoryDistribution: Object.entries(byCategory).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalCards) * 100)
    }))
  };
};

// Get recipe card by component ID
export const getRecipeCard = (componentId: string): RecipeCardDefinition | undefined => {
  return recipeCardDefinitions[componentId];
};

// Get recipe cards by category
export const getRecipeCardsByCategory = (category: RecipeCategory): RecipeCardDefinition[] => {
  return Object.values(recipeCardDefinitions).filter(card => card.category === category);
};

// Search recipe cards
export const searchRecipeCards = (query: string): RecipeCardDefinition[] => {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(recipeCardDefinitions).filter(card => 
    card.friendlyName.toLowerCase().includes(lowercaseQuery) ||
    card.friendlyDescription.toLowerCase().includes(lowercaseQuery) ||
    card.useCase.toLowerCase().includes(lowercaseQuery) ||
    Object.values(card.personas || {}).some(persona => 
      persona.example.toLowerCase().includes(lowercaseQuery)
    )
  );
};

// Get recipe card statistics
export const getRecipeCardStats = (registry: ComponentDefinition[]): RecipeCardStats => {
  return validateRecipeCards(registry);
};

// Export recipe categories for UI
export const getRecipeCategories = (): RecipeCategoryInfo[] => {
  return recipeCategoryInfo;
};

// Get persona examples for a component
export const getPersonaExamples = (componentId: string, persona: string): string | undefined => {
  const recipeCard = recipeCardDefinitions[componentId];
  if (!recipeCard || !recipeCard.personas) return undefined;
  
  const personaData = recipeCard.personas[persona as keyof typeof recipeCard.personas];
  return personaData?.example;
};

// Recipe card mapping validation
export const validateRecipeCardMapping = (): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for consistent naming
  Object.entries(recipeCardDefinitions).forEach(([id, card]) => {
    if (!card.friendlyName || card.friendlyName.trim() === '') {
      issues.push(`Missing friendlyName for component: ${id}`);
    }
    
    if (!card.friendlyDescription || card.friendlyDescription.trim() === '') {
      issues.push(`Missing friendlyDescription for component: ${id}`);
    }
    
    if (!card.useCase || card.useCase.trim() === '') {
      issues.push(`Missing useCase for component: ${id}`);
    }
    
    if (!card.preview || card.preview.trim() === '') {
      issues.push(`Missing preview for component: ${id}`);
    }
    
    // Check persona completeness
    if (card.personas) {
      const requiredPersonas = ['business', 'healthcare', 'educator', 'enterprise', 'casual'];
      requiredPersonas.forEach(persona => {
        if (!card.personas![persona as keyof typeof card.personas]) {
          issues.push(`Missing persona '${persona}' for component: ${id}`);
        }
      });
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Export metadata for registry integration
export const RECIPE_CARD_METADATA = {
  version: '1.0.0',
  totalCards: Object.keys(recipeCardDefinitions).length,
  lastUpdated: new Date().toISOString(),
  categories: recipeCategoryInfo.map(cat => cat.id),
  validation: validateRecipeCardMapping(),
  notes: [
    'All recipe cards include real-world use cases',
    'Persona examples are industry-specific',
    'Preview formats show visual component representation',
    'Categories align with traditional component categories',
    'Payment components mapped to special_fields category',
    'All original attributes preserved: minPlan, trialAllowed, defaultProps with complete structure'
  ]
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Add recipe cards to existing component registry
export const addRecipeCardsToRegistry = (componentRegistry: ComponentDefinition[]): ComponentDefinition[] => {
    console.log('>>>>>>>>>> inside addRecipeCardsToRegistry');
  return componentRegistry.map(component => {
    console.log(`component.id: ${component.id}`)
    const recipeCard = recipeCardDefinitions[component.id];
    if (recipeCard) {
      return {
        ...component,
        recipeCard
      };
    }
    return component;
  });
};

// Get components by recipe category
export const getComponentsByRecipeCategory = (
  category: RecipeCategory, 
  componentRegistry: ComponentDefinition[]
): ComponentDefinition[] => {
  return componentRegistry.filter(comp => comp.recipeCard?.category === category);
};