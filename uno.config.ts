import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
  presetTypography,
  // transformerDirectives,
  // transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetTypography(),
  ],
  // transformers: [
  //   transformerDirectives(),
  //   transformerVariantGroup(),
  // ],
  theme: {
    colors: {
      // SmartForms brand colors
      primary: {
        DEFAULT: '#ff6600',
        50: '#fff5eb',
        100: '#ffe5cc',
        200: '#ffcc99',
        300: '#ffb366',
        400: '#ff9933',
        500: '#ff6600',
        600: '#cc5200',
        700: '#993d00',
        800: '#662900',
        900: '#331400',
      },
      secondary: {
        DEFAULT: '#5b6af3',
        50: '#eef0fe',
        100: '#d9ddfc',
        200: '#b3bbf9',
        300: '#8d9af6',
        400: '#6778f3',
        500: '#5b6af3',
        600: '#4755c2',
        700: '#354092',
        800: '#242a61',
        900: '#121531',
      },
      // Semantic colors
      success: {
        DEFAULT: '#10b981',
        light: '#d1fae5',
        dark: '#065f46',
      },
      warning: {
        DEFAULT: '#f59e0b',
        light: '#fef3c7',
        dark: '#78350f',
      },
      error: {
        DEFAULT: '#ef4444',
        light: '#fee2e2',
        dark: '#7f1d1d',
      },
      info: {
        DEFAULT: '#3b82f6',
        light: '#dbeafe',
        dark: '#1e3a8a',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
    },
    breakpoints: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  shortcuts: {
    // Button shortcuts
    'btn': 'px-4 py-2 rounded-md font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
    'btn-secondary': 'btn bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700',
    'btn-outline': 'btn border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
    
    // Form shortcuts
    'input-base': 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'label-base': 'block text-sm font-medium text-gray-700 mb-1',
    
    // Layout shortcuts
    'container': 'mx-auto px-4 sm:px-6 lg:px-8',
    'card': 'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
    'panel': 'bg-white border-r border-gray-200 h-full overflow-y-auto',
    
    // Form designer specific
    'designer-panel': 'panel p-4',
    'component-card': 'p-3 border border-gray-200 rounded-lg cursor-move hover:border-primary-300 hover:shadow-sm transition-all duration-200',
    'drop-zone': 'min-h-20 border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors',
    'drop-zone-active': 'border-primary-400 bg-primary-50',
  },
  rules: [
    // Custom rules for form designer
    ['grid-cols-form', { 'grid-template-columns': '380px 1fr 320px' }],
    ['grid-cols-form-tablet', { 'grid-template-columns': '1fr 320px' }],
  ],
})