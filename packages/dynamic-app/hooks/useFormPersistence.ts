import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useFormStore } from 'store/formStore';
import { v4 as uuidv4 } from 'uuid';
import { blobUrlToDataUrl } from 'utils/blob';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  console.log('raw response status:', res.status);
  if (!res.ok) {
    throw new Error(`Error fetching ${url}: ${res.statusText}`);
  }
  const data = await res.json();
  console.log('parsed JSON:', data);
  return data;
};

export function useFormPersistence() { 
  const router = useRouter();
  const { formId: queryId, version: version } = router.query as {
    formId?: string;
    version?: string;
  };
  
  // Key for SWR: matches how Dashboard seeded it
  const swrKey = queryId && version
          ? `/api/forms/designer/${queryId}/${version}`
          : null;
  // Attempt to read draft from cache or fetch if missing (unlikely, since we seeded)
  const { data: draft, error } = useSWR(swrKey, fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false,
        shouldRetryOnError: false,
      });

  const {
    formId, formTitle, setFormTitle, setFormId,
    loadForm, canvasElements, elements, isPreview, togglePreview,
  } = useFormStore();

  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const logoElement = elements.find(e => e.type === 'logo') ?? null;

  // If no formId in query, figure out fallback behavior
  useEffect(() => {
    if (!queryId) {
      const origin = typeof window !== "undefined"
        ? sessionStorage.getItem("lastOrigin")
        : null;
      if (origin === "wip") {
        // User clicked a draft but lost query—send back to dashboard
        router.replace("/dashboard");
      }
      // Otherwise (origin === "startNew" or anything else), show blank canvas
    }
  }, [queryId, router]);

  // Once we mount, clear the “lastOrigin” flag
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("lastOrigin");
    }
  }, []);

  // Auto-load on mount if formid & version are provided
  useEffect(() => {
    // bail out until we actually have a draft object
    if (!draft) {
      return;
    }
    
    const { formId: id, title: title, rawJson } = draft;

    if (!rawJson) {
      console.warn('Loaded draft but rawJson is missing');
      return;
    }

    console.log('Auto-loading form from draft:', { id, title, rawJson });
    loadForm({
      id,
      title,
      logoElement: rawJson.logo ?? null,
      elements: rawJson.elements ?? [],
    });
  }, [draft, loadForm]);

  // Ensure a title, prompting if missing
  async function ensureTitle(): Promise<string|null> {
    if (!formTitle) {
      const t = prompt('Enter form title:')?.trim() || '';
      if (!t) { alert('Title required'); return null; }
      setFormTitle(t);
      return t;
    }
    return formTitle;
  }

  // Serialize logo placeholder into data-URL if needed
  async function snapshotLogo() {
    if (!logoElement?.placeholder?.startsWith('blob:')) return logoElement;
    const dataUrl = await blobUrlToDataUrl(logoElement.placeholder);
    return { ...logoElement, placeholder: dataUrl };
  }

  // Save (POST/UPSERT)
  async function save() {
    const title = await ensureTitle(); 
    if (!title?.trim()) 
      return;
    setSaving(true);
    try {
      const logo = await snapshotLogo();
      const rawJson = {
        id: formId || uuidv4(),
        title,
        logo,
        elements: canvasElements,
      };
      let res: Response;
      if (!formId) {
          res = await fetch('/api/forms/designer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, rawJson }),
        });
      } else {
        res = await fetch(`/api/forms/designer/${formId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawJson })
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw err;
      }
      const { formId: newId, version } = await res.json();
      setFormId(newId);
      router.replace(
        {
          pathname: "/form-builder",
          query: { formId: newId, version: version },
        },
        "/form-builder"
      );
    } catch (error: any) {
      console.error('Save failed:', error);
      throw error;
    }finally {
      setSaving(false);
    }
  }

  // Export JSON to file
  async function exportJSON() {
    const title = await ensureTitle(); if (!title) return;
    const logo = await snapshotLogo();
    const data = { id: formId || uuidv4(), title, logo, elements: canvasElements };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title}.json`; a.click();
    URL.revokeObjectURL(url);
  }
  
  // Import JSON from file
  function importJSON(file: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const payload = JSON.parse(reader.result as string);
      loadForm({ id: payload.id, title: payload.title, logoElement: payload.logo, elements: payload.elements });
    };
    reader.readAsText(file);
  }

  return {
    saving,
    save,
    exportJSON,
    importJSON,
    fileInput,
    isPreview,
    togglePreview,
    triggerImport: () => fileInput.current?.click(),
  };
}