import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '@smartforms/shared/components/ui/Navbar';
import Footer from '@smartforms/shared/components/ui/Footer';
import ControlsBar from 'components/designer/ControlsBar';
import { useFormPersistence } from 'hooks/useFormPersistence';
import PreviewForm from 'components/form-builder/PreviewForm';
// import { FiGrid, FiSettings } from 'react-icons/fi';
import { Grid, Settings } from 'lucide-react';
import { useMediaQuery } from 'hooks/useMediaQuery';

const LeftPanel  = dynamic(() => import('components/ui/LeftPanel'), { ssr: false });
const RightPanel = dynamic(() => import('components/ui/RightPanel'), { ssr: false });
const FormCanvas = dynamic(() => import('components/canvas/Canvas'), { ssr: false });

export default function FormBuilder() {
  useFormPersistence(); // Ensure the hook is used to trigger re-renders
  const { isPreview } = useFormPersistence();
  const isMobile = useMediaQuery('(max-width:1200px)');

  const [leftOpen, setLeftOpen]   = useState(!isMobile);
  const [rightOpen, setRightOpen] = useState(!isMobile);

  // auto-collapse on resize
  useEffect(() => {
    setLeftOpen(!isMobile);
    setRightOpen(!isMobile);
  }, [isMobile]);

  // track the 3D mode locally
  // const [threeDMode, setThreeDMode] = useState<ThreeDMode>('none');
  return (
    <div className="designer-page">
      <NavBar />
      <ControlsBar />

      {isMobile && (
       <>
         {/* Left icon strip */}
         <div
           className="offcanvas-toggle left"
           onClick={() => setLeftOpen(o => !o)}
           title="Form Elements"
         >
           <Grid size={24} />
         </div>
         {/* Right icon strip */}
         <div
           className="offcanvas-toggle right"
           onClick={() => setRightOpen(o => !o)}
           title="Properties Editor"
         >
           <Settings size={24} />
         </div>
       </>
      )}


      {isPreview ? (
        <>
          {/* <ThreeDToggle mode={threeDMode} onChange={setThreeDMode} /> */}
          {/* <div className={`preview-container ${threeDMode}`}> */}
          <div className={`preview-container floating`}>
            <PreviewForm />
          </div>
        </>
      ) : (
        <div className="designer-main">
        {/* <div className={`left-panel${leftOpen? ' open':' collapsed'}`}> */}
          <LeftPanel />
        {/* </div> */}
        <div className="canvas-wrapper-designer">
          <FormCanvas />
        </div>
        {/* <div className={`right-panel${rightOpen? ' open':' collapsed'}`}> */}
          <RightPanel />
        {/* </div> */}
      </div>
      )}
      <Footer />
    </div>
  );
}