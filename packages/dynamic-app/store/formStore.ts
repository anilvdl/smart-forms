import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { IconKey } from "@smartforms/shared/icons";

export interface FormElement {
    id: string;
    type: string;
    icon: IconKey;
    label: string;
    tag?: string;
    category: string;
    placeholder?: string;
    style?: React.CSSProperties; // We'll store final styles here
    inputType?: string; // Optional: only applicable for input-based elements
    x?: number; // X-coordinate for positioning
    y?: number; // Y-coordinate for positioning
    size?: number; // Size for elements like logos
    alignment?: string; // Alignment for elements like logos
    notInPanel?: boolean; // Optional: hide from the left panel
    templateId?: string; // Optional: reference to the original
    required?: boolean; // Optional: for validation
    // For short text char limits
    charLimitEnabled?: boolean; // toggles whether min/max apply
    minChars?: number;
    maxChars?: number;
    /** 
   * A place to stash element-specific settings (options, default values, min/max, timezone, etc.)
   */
    properties?: {
      title?: string; // Optional: title for the element
      // for radio/checkbox/select
      options?: { value: string; label: string }[];
      defaultValue?: string;

      // for date/time
      dateFormat?: string;   // e.g. "yyyy-MM-dd" or "MM/dd/yyyy"
      timeFormat?: string;   // e.g. "HH:mm" or "hh:mm aa"
      format?: string; // e.g. "YYYY-MM-DD"
      ampm?: string; // 12-hour format "AM/PM" or 24-hour format "HH:mm"
      timezone?: string;
      minDate?: string;   // YYYY-MM-DD
      maxDate?: string;   // YYYY-MM-DD
      minTime?: string;   // HH:MM
      maxTime?: string;   // HH:MM

      // for label text
      text?: string; // Optional: text content for label elements
      size?: number; // Optional: font size for label elements
      color?: string; // Optional: color for label elements
      alignment?: string; // Optional: alignment for label elements
      bold?: boolean; // Optional: bold text for label elements
      italic?: boolean; // Optional: italic text for label elements
      underline?: boolean; // Optional: underline text for label elements
      multiLine?: boolean; // Optional: multiline text for label elements
    };
  }

  // const createNoopStorage = (): PersistStorage<unknown> => ({
  //   getItem: (_key: string) => null,
  //   setItem: (_key: string, _value: StorageValue<unknown>) => {},
  //   removeItem: (_key: string) => {},
  // });

interface FormStore {
  elements: FormElement[];

  canvasElements: FormElement[];

  selectedElementId: string | null;

  // Example global states for the canvas
  canvasWidth: number;
  canvasHeight: number;
  isPreview: boolean;
  // NEW form metadata
  formId: string | null;
  formTitle: string;

  setSelectedElementId: (id: string | null) => void;

  addElement: (el: FormElement) => void;
  removeElement: (id: string) => void;
  updateElement: (updatedEl: FormElement) => void;

  // Reordering in the canvas
  moveElement: (fromIndex: number, toIndex: number) => void;
  findElementIndex: (id: string) => number;

  // Add these lines if they’re missing:
  addCanvasElement: (tmpl: FormElement, x: number, y: number) => void;
  removeCanvasElement: (id: string) => void;
  updateCanvasElement: (updatedEl: FormElement) => void;

  // NEW: insert at a given index (for drop-between-rows)
  insertCanvasElementAt: (tmpl: FormElement, index: number) => void;
  // NEW: reorder existing rows
  moveCanvasElement: (id: string, toIndex: number) => void;
  resetStore: () => void;

  togglePreview: () => void;
  setCanvasSize: (width: number, height: number) => void;

  // NEW metadata setters
  setFormTitle: (title:string)=>void;
  setFormId: (id:string)=>void;
  loadForm: (payload: {
    id: string;
    title: string;
    logoElement: FormElement | null;
    elements: FormElement[];
  }) => void;
}

const initialState = {
    canvasElements: [] as FormElement[],
    selectedElementId: null as string | null,
    canvasWidth: 600,
    canvasHeight: 400,
    isPreview: false,
    formTitle: '',
    formId: null as string | null,
};

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
        elements: [
          // Optionally pre-create a single "logo" element
          {
            id: "id-logo",
            type: "logo",
            label: "Logo",
            category: "UI / Structural",
            icon: "",
            placeholder: "",   // could store the URL or data here
            size: 100,
            style: { width: 100, display: "block", margin: "0 auto" }, // default center alignment
            x: 0,
            y: 0,
            notInPanel: true, // hide from the left panel
          },
          // --- UI/Structural Elements ---
          {
            id: "header",
            type: "header",
            label: "Header",
            placeholder: "Enter your header",
            icon: "header",
            category: "UI / Structural",
          },
          {
            id: "divider",
            type: "divider",
            label: "Divider",
            placeholder: "",
            icon: "divider",
            category: "UI / Structural",
          },
          {
            id: "pageBreak",
            type: "pageBreak",
            label: "Page Break",
            placeholder: "",
            icon: "page-break",
            category: "UI / Structural",
          },
        
          // --- Basic Text Inputs ---
          {
            id: "shortText",
            type: "text",
            label: "Short Text",
            placeholder: "Enter short text",
            icon: "text",
            category: "Basic Text",
          },
          {
            id: "longText",
            type: "textarea",
            label: "Long Text",
            placeholder: "Enter long text",
            icon: "long-text",
            category: "Basic Text",
          },
          {
            id: "label",
            type: "label",
            label: "Label",
            placeholder: "Enter label text",
            icon: "label",       // ← please confirm this IconKey or pick another
            category: "Basic Text",
            properties: {
              text: "Label",
              size: 16,
              color: "#000000",
              alignment: "left",
              bold: false,
              italic: false,
              underline: false
            }
          },
          
        
          // --- Specialized Text Inputs ---
          {
            id: "email",
            type: "email",
            label: "Email",
            placeholder: "Enter your email",
            icon: "email",
            category: "Specialized Text",
          },
          {
            id: "password",
            type: "password",
            label: "Password",
            placeholder: "Enter password",
            icon: "password",
            category: "Specialized Text",
          },
          {
            id: "tel",
            type: "tel",
            label: "Phone Number",
            placeholder: "Enter phone",
            icon: "tel",
            category: "Specialized Text",
          },
          {
            id: "url",
            type: "url",
            label: "URL",
            placeholder: "Enter URL",
            icon: "url",
            category: "Specialized Text",
          },
          {
            id: "search",
            type: "search",
            label: "Search",
            placeholder: "Search...",
            icon: "search",
            category: "Specialized Text",
          },
        
          // --- Date & Time Inputs ---
          {
            id: "date",
            type: "date",
            label: "Date",
            placeholder: "",
            icon: "date",
            category: "Date / Time",
          },
          {
            id: "time",
            type: "time",
            label: "Time",
            placeholder: "",
            icon: "time",
            category: "Date / Time",
          },
          {
            id: "dateTime",
            type: "datetime-local",
            label: "Date & Time",
            placeholder: "",
            icon: "date-time",
            category: "Date / Time",
          },
        
          // --- Numeric & Range ---
          {
            id: "number",
            type: "number",
            label: "Number",
            placeholder: "Enter number",
            icon: "number",
            category: "Numeric / Range",
          },
          {
            id: "range",
            type: "range",
            label: "Range",
            placeholder: "",
            icon: "range",
            category: "Numeric / Range",
          },
        
          // --- Choice Inputs ---
          {
            id: "singleChoice",
            type: "radio",
            label: "Single Choice",
            placeholder: "",
            icon: "choice",
            category: "Choice Inputs",
            properties: {
              options: [
                { value: "option1", label: "Option 1" },
              ]
            },
          },
          {
            id: "multiChoice",
            type: "checkbox",
            label: "Multi Choice",
            placeholder: "",
            icon: "multi-choice",
            category: "Choice Inputs",properties: {
              options: [
                { value: "option1", label: "Option 1" },  
                { value: "option2", label: "Option 2" },
                { value: "option3", label: "Option 3" },
              ]
            },
          },
          {
            id: "dropdown",
            type: "select",
            label: "Dropdown",
            placeholder: "",
            icon: "dropdown",
            category: "Choice Inputs",
          },
        
          // --- File & Media ---
          {
            id: "fileUpload",
            type: "file",
            label: "File Upload",
            placeholder: "",
            icon: "file-upload",
            category: "File / Media",
          },
          {
            id: "colorPicker",
            type: "color",
            label: "Color Picker",
            placeholder: "",
            icon: "color-picker",
            category: "File / Media",
          },
          {
            id: "image",
            type: "img",
            label: "Image",
            placeholder: "",
            icon: "image",
            category: "File / Media",
          },
          {
            id: "video",
            type: "video",
            label: "Video",
            placeholder: "Enter video URL",
            icon: "video",
            category: "File / Media",
          },
          
          // --- Table & Complex Fields ---
          {
            id: "inputTable",
            type: "table",
            label: "Input Table",
            placeholder: "",
            icon: "table",
            category: "Complex Fields",
          },
        
          // --- Hidden & Misc ---
          {
            id: "hidden",
            type: "hidden",
            label: "Hidden",
            placeholder: "",
            icon: "hidden",
            category: "Misc",
          },
        
          // --- Buttons ---
          {
            id: "submit",
            type: "submit",
            label: "Submit",
            placeholder: "",
            icon: "submit",
            category: "Buttons",
          },
          {
            id: "reset",
            type: "reset",
            label: "Reset",
            placeholder: "",
            icon: "reset",
            category: "Buttons",
          },
        ],
        // 2) The actual dropped instances
        canvasElements: [],
        selectedElementId: null,
        canvasWidth: 600,
        canvasHeight: 400,
        isPreview: false,
        formId: null,
        formTitle: '',

        setSelectedElementId: (id) => set({ selectedElementId: id }),

        addElement: (el) =>
          set((state) => ({
            elements: [...state.elements, { ...el, id: uuidv4(), templateId: el.id }],
          })),

        removeElement: (id) =>
          set((state) => {
            const newEls = state.elements.filter((el) => el.id !== id);
            const { selectedElementId } = get();
            return { 
              elements: newEls,
              // Clear selection if removing the selected item
              selectedElementId: selectedElementId === id ? null : selectedElementId,
            };
          }),

        updateElement: (updatedEl) =>
          set((state) => ({
            elements: state.elements.map((el) =>
              el.id === updatedEl.id ? updatedEl : el
            ),
          })),

        moveElement: (fromIndex, toIndex) =>
          set((state) => {
            const arr = [...state.elements];
            const [moved] = arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, moved);
            return { elements: arr };
          }),

        // 4) insertCanvasElementAt => drop-between-rows
        insertCanvasElementAt: (tmpl: FormElement, index: number) => {
          const newEl: FormElement = {
            ...tmpl,
            templateId: tmpl.id,
            id: uuidv4(),
            // x/y aren’t used in full-width flow; leave undefined
          };
          set(state => {
            const els = [...state.canvasElements];
            els.splice(index, 0, newEl);
            return { canvasElements: els };
          });
        },

        // 5) moveCanvasElement => reorder existing rows
        moveCanvasElement: (id: string, toIndex: number) => {
          set(state => {
            const els = [...state.canvasElements];
            const fromIndex = els.findIndex(el => el.id === id);
            if (fromIndex < 0 || fromIndex === toIndex) return {};
            const [moved] = els.splice(fromIndex, 1);
            els.splice(toIndex, 0, moved);
            return { canvasElements: els };
          });
        },  

        findElementIndex: (id) => {
          const els = get().elements;
          return els.findIndex((el) => el.id === id);
        },

        togglePreview: () => {
          set((state) => ({ isPreview: !state.isPreview }));
        },
  
        setCanvasSize: (width, height) => {
          set({ canvasWidth: width, canvasHeight: height });
        },

        // 3) addCanvasElement => create a new instance with a unique id
        addCanvasElement: (tmpl: FormElement, x: number, y: number) => {
          console.log("addCanvasElement->tmpl: ", tmpl);
          const newElement: FormElement = {
            ...tmpl,
            templateId: tmpl.id,
            id: uuidv4(),
            x,
            y,
          };
          set((state) => ({
            canvasElements: [...state.canvasElements, newElement],
          }));
        },

        removeCanvasElement: (id: string) => {
          console.log("removeCanvasElement->id: ", id);
          set((state) => {
            const newEls = state.canvasElements.filter((el) => el.id !== id);
            return {
              canvasElements: newEls,
              selectedElementId:
                state.selectedElementId === id ? null : state.selectedElementId,
            };
          });
        },

        updateCanvasElement: (updatedEl: FormElement) => {
          console.log("updateCanvasElement->updatedEl: ", updatedEl);
          set((state) => ({
            canvasElements: state.canvasElements.map((el) =>
              el.id === updatedEl.id ? updatedEl : el
            ),
          }));
        },

      // NEW: set the form’s title
      setFormTitle: (title) => set({ formTitle: title }),
      setFormId: (id) => set({ formId: id }),
      // NEW: load serialized form into store
      loadForm: ({ id, title, logoElement, elements }) => {
        set({
          formId: id,
          formTitle: title,
          canvasElements: elements,
          selectedElementId: logoElement?.id ?? null,
        });
        if (logoElement) {
          set(state => ({
            elements: state.elements.map(el =>
              // override _any_ element whose type is 'logo'
              el.type === 'logo'
                ? { 
                    ...el,
                    // keep its original id (template id),
                    // but override placeholder/style with imported data
                    placeholder: logoElement.placeholder,
                    style: logoElement.style,
                    // and any other props you care about…
                  }
                : el
            )
          }));
        }
      },

        resetStore: () => {
          // wipe the in-memory state
          set({
            ...initialState,
            elements: get().elements, // keep the original elements
            // canvasElements: [],
            // selectedElementId: null,
          });
          // if you’re persisting to localStorage, you may also want to clear it:
          //  getStorage().removeItem('my-form-data');
          // but often just calling set(...) is enough to overwrite.
        }
      }),
      { 
        name: "my-form-data", // localStorage key
        version: 10,
        migrate: (persistedState, version) => {
          console.log("migrating form data from version", version);
          // if the persisted data is from an older version, drop it
          if (version > 2) {
            return initialState;
          }
          return persistedState!;
        }
        // default storage is localStorage; you can partialize or pass custom storage later
        // storage:
        //   typeof window !== "undefined"
        //     ? createJSONStorage(() => localStorage)
        //     : createNoopStorage(), // fallback for SSR
      } 
  )
);
// This store manages the state of the left and right panels in the UI.
// It uses Zustand for state management and provides methods to toggle the visibility of the panels.
// The panels can be collapsed or expanded, and their states are stored in the Zustand store.
// The store is created using the create function from Zustand, and the state is initialized with default values.
// The toggle methods update the state of the panels when called.
// The store can be used in any component to manage the panel states, allowing for a responsive and dynamic UI.
// This store is useful for applications that require a flexible layout with collapsible panels,
// such as dashboards or design tools where users can customize their workspace.
interface PanelStore {
    isLeftPanelCollapsed: boolean;
    toggleLeftPanel: () => void;
  
    isRightPanelCollapsed: boolean;
    toggleRightPanel: () => void;
  }
  
export const usePanelStore = create<PanelStore>((set) => ({
  // Default states
  isLeftPanelCollapsed: false,
  isRightPanelCollapsed: false,

  toggleLeftPanel: () =>
    set((state) => ({
      isLeftPanelCollapsed: !state.isLeftPanelCollapsed,
    })),

  toggleRightPanel: () =>
    set((state) => ({
      isRightPanelCollapsed: !state.isRightPanelCollapsed,
    })),
}));