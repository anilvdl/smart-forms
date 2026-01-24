// Keyboard Shortcuts Hook for Form Designer
import { useEffect, useRef } from 'react';
import { useFormBuilder } from './formBuilderContext';

interface ShortcutAction {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category: 'Element Actions' | 'Navigation' | 'Edit' | 'View';
}

export const useKeyboardShortcuts = () => {
  const {
    selectedElement,
    form,
    deleteElement,
    duplicateElement,
    moveElement,
    undo,
    redo,
    toggleComponentPanel,
    togglePropertiesPanel,
    saveForm
  } = useFormBuilder();
  
  const lastActionRef = useRef<string>('');
  
  const shortcuts: ShortcutAction[] = [
    // Element Actions
    {
      key: 'Delete',
      action: () => {
        if (selectedElement) {
          deleteElement(selectedElement);
          lastActionRef.current = 'delete';
        }
      },
      description: 'Delete selected element',
      category: 'Element Actions'
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => {
        if (selectedElement) {
          duplicateElement(selectedElement);
          lastActionRef.current = 'duplicate';
        }
      },
      description: 'Duplicate selected element',
      category: 'Element Actions'
    },
    
    // Navigation - Move elements up/down in form order
    {
      key: 'ArrowUp',
      action: () => {
        if (selectedElement) {
          moveElement(selectedElement, 'up');
          lastActionRef.current = 'move-up';
        }
      },
      description: 'Move element up in form order',
      category: 'Navigation'
    },
    {
      key: 'ArrowDown',
      action: () => {
        if (selectedElement) {
          moveElement(selectedElement, 'down');
          lastActionRef.current = 'move-down';
        }
      },
      description: 'Move element down in form order',
      category: 'Navigation'
    },
    {
      key: 'ArrowUp',
      shiftKey: true,
      action: () => {
        if (selectedElement && form) {
          // Jump by larger blocks - move to top of current section or 5 positions up
          const currentIndex = form.elements.findIndex(el => el.id === selectedElement);
          const jumpSize = Math.min(5, currentIndex);
          for (let i = 0; i < jumpSize; i++) {
            moveElement(selectedElement, 'up');
          }
          lastActionRef.current = 'jump-up';
        }
      },
      description: 'Jump element up by 5 positions',
      category: 'Navigation'
    },
    {
      key: 'ArrowDown',
      shiftKey: true,
      action: () => {
        if (selectedElement && form) {
          // Jump by larger blocks - move to bottom of current section or 5 positions down
          const currentIndex = form.elements.findIndex(el => el.id === selectedElement);
          const jumpSize = Math.min(5, form.elements.length - 1 - currentIndex);
          for (let i = 0; i < jumpSize; i++) {
            moveElement(selectedElement, 'down');
          }
          lastActionRef.current = 'jump-down';
        }
      },
      description: 'Jump element down by 5 positions',
      category: 'Navigation'
    },
    
    // Edit Actions
    {
      key: 'z',
      ctrlKey: true,
      action: () => {
        undo();
        lastActionRef.current = 'undo';
      },
      description: 'Undo last action',
      category: 'Edit'
    },
    {
      key: 'y',
      ctrlKey: true,
      action: () => {
        redo();
        lastActionRef.current = 'redo';
      },
      description: 'Redo last action',
      category: 'Edit'
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        redo();
        lastActionRef.current = 'redo';
      },
      description: 'Redo last action (alternative)',
      category: 'Edit'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        saveForm();
        lastActionRef.current = 'save';
      },
      description: 'Save form',
      category: 'Edit'
    },
    
    // View Actions
    {
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        toggleComponentPanel();
        lastActionRef.current = 'toggle-components';
      },
      description: 'Toggle component panel',
      category: 'View'
    },
    {
      key: 'p',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        togglePropertiesPanel();
        lastActionRef.current = 'toggle-properties';
      },
      description: 'Toggle properties panel',
      category: 'View'
    },
    {
      key: 'Escape',
      action: () => {
        // Clear selection or close panels
        // This will be handled in the main component
        lastActionRef.current = 'escape';
      },
      description: 'Clear selection / Close panels',
      category: 'View'
    }
  ];
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }
      
      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key === event.key &&
          !!shortcut.ctrlKey === (event.ctrlKey || event.metaKey) &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey
        );
      });
      
      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, form, shortcuts]);
  
  return {
    shortcuts,
    lastAction: lastActionRef.current
  };
};

// Keyboard shortcuts help data for displaying in help panel
export const getKeyboardShortcuts = (): ShortcutAction[] => [
  {
    key: 'Delete',
    action: () => {},
    description: 'Delete selected element',
    category: 'Element Actions'
  },
  {
    key: 'Ctrl + D',
    action: () => {},
    description: 'Duplicate selected element',
    category: 'Element Actions'
  },
  {
    key: '↑ / ↓',
    action: () => {},
    description: 'Move element up/down in form',
    category: 'Navigation'
  },
  {
    key: 'Shift + ↑ / ↓',
    action: () => {},
    description: 'Jump element by 5 positions',
    category: 'Navigation'
  },
  {
    key: 'Ctrl + Z',
    action: () => {},
    description: 'Undo last action',
    category: 'Edit'
  },
  {
    key: 'Ctrl + Y',
    action: () => {},
    description: 'Redo last action',
    category: 'Edit'
  },
  {
    key: 'Ctrl + S',
    action: () => {},
    description: 'Save form',
    category: 'Edit'
  },
  {
    key: 'Ctrl + Shift + C',
    action: () => {},
    description: 'Toggle component panel',
    category: 'View'
  },
  {
    key: 'Ctrl + Shift + P',
    action: () => {},
    description: 'Toggle properties panel',
    category: 'View'
  },
  {
    key: 'Escape',
    action: () => {},
    description: 'Clear selection / Close panels',
    category: 'View'
  }
];