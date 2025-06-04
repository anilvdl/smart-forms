"use client";
import { useFormPersistence } from 'hooks/useFormPersistence';
import {  Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { FiMenu } from 'react-icons/fi';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { useState } from 'react';
import { SaveErrorModal } from 'components/modals/ErrorModal';


export default function ControlsBar() {
  const { saving, save, exportJSON, importJSON, triggerImport, togglePreview, fileInput, isPreview } = useFormPersistence();
  const isMobile = useMediaQuery('(max-width:1200px)');
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      await save();
    } catch (err: any) {
      // Capture the error and show the modal
      setSaveError(err.message || 'Unknown error occurred');
    }
  };

  if(isPreview) {  
    return(
        <div className="canvas-menu-top">
            <button onClick={togglePreview}>Back to Design</button>
        </div>
    ) ;
  }

  if (isMobile) {
      return (
        <div className="mobile-hamburger-container">
            <Menu as="div" className="designer-controls mobile">
              <MenuButton className="hamburger">
                <FiMenu size={24} />
              </MenuButton>
              <MenuItems className="dropdown-menu">
                <MenuItem><button onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button></MenuItem>
                <MenuItem><button onClick={exportJSON}>Export JSON</button></MenuItem>
                <MenuItem>
                    <button onClick={triggerImport}>Import JSON</button>
                </MenuItem>
                <MenuItem><button>Settings</button></MenuItem>
                <MenuItem><button>Publish</button></MenuItem>
                <MenuItem><button onClick={togglePreview}>Preview</button></MenuItem>
              </MenuItems>
            </Menu>
            {/* invisible file input */}
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={e => e.target.files && importJSON(e.target.files[0])}
            />
            {saveError && (
              <SaveErrorModal
                message={saveError}
                onClose={() => setSaveError(null)}
              />
            )}
        </div>
      );
  }

  return (
    <div className="canvas-menu-top">
      <button>Settings</button>
      <button>Publish</button>
      <button onClick={togglePreview}>Preview</button>
      <button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      <button onClick={exportJSON}>Export JSON</button>
      <button onClick={triggerImport}>Import JSON</button>
      <input
        type="file"
        accept="application/json"
        ref={fileInput}
        style={{ display: 'none' }}
        onChange={e => e.target.files && importJSON(e.target.files[0])}
      />
      {saveError && (
        <SaveErrorModal
          message={saveError}
          onClose={() => setSaveError(null)}
        />
      )}
    </div>
  );
}