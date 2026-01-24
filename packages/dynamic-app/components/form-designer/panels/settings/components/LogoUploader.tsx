// Logo Uploader with Drag-and-Drop and Crop/Resize Tools
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Crop, RotateCcw, Check, Image as ImageIcon } from 'lucide-react';
import styles from '@smartforms/dynamic-app/styles/form-designer/components/logo-uploader.module.css';

interface LogoData {
  url: string;
  size: 'small' | 'medium' | 'large';
  alignment: 'left' | 'center' | 'right';
  width?: number;
  height?: number;
}

interface LogoUploaderProps {
  currentLogo: LogoData | null;
  onLogoUpdate: (logo: LogoData) => void;
  onLogoRemove: () => void;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogo,
  onLogoUpdate,
  onLogoRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCropTool, setShowCropTool] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [cropData, setCropData] = useState<CropData>({ x: 0, y: 0, width: 100, height: 100 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<HTMLDivElement>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      processFile(imageFile);
    }
  }, []);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }, []);
  
  const processFile = (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or SVG file');
      return;
    }
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowCropTool(true);
  };
  
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageNaturalSize({ width: naturalWidth, height: naturalHeight });
      
      // Set initial crop to center 80% of the image
      const cropSize = Math.min(naturalWidth, naturalHeight) * 0.8;
      setCropData({
        x: (naturalWidth - cropSize) / 2,
        y: (naturalHeight - cropSize) / 2,
        width: cropSize,
        height: cropSize
      });
    }
  };
  
  const handleCropChange = (newCropData: Partial<CropData>) => {
    setCropData(prev => ({ ...prev, ...newCropData }));
  };
  
  const applyCrop = async () => {
    if (!selectedFile || !imageRef.current) return;
    
    setIsUploading(true);
    
    try {
      // Create canvas for cropping
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get canvas context');
      
      // Calculate scale factor
      const img = imageRef.current;
      const scaleX = imageNaturalSize.width / img.offsetWidth;
      const scaleY = imageNaturalSize.height / img.offsetHeight;
      
      // Set canvas size to crop dimensions
      canvas.width = cropData.width * scaleX;
      canvas.height = cropData.height * scaleY;
      
      // Create new image for cropping
      const sourceImg = new Image();
      sourceImg.onload = () => {
        // Draw cropped portion
        ctx.drawImage(
          sourceImg,
          cropData.x * scaleX,
          cropData.y * scaleY,
          cropData.width * scaleX,
          cropData.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        // Convert to blob and create URL
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedUrl = URL.createObjectURL(blob);
            
            const logoData: LogoData = {
              url: croppedUrl,
              size: 'medium',
              alignment: 'center',
              width: canvas.width,
              height: canvas.height
            };
            
            onLogoUpdate(logoData);
            setShowCropTool(false);
            setSelectedFile(null);
            setPreviewUrl('');
          }
        }, 'image/png', 0.9);
      };
      
      sourceImg.src = previewUrl;
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const cancelCrop = () => {
    setShowCropTool(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };
  
  const resetCrop = () => {
    if (imageNaturalSize.width > 0) {
      const cropSize = Math.min(imageNaturalSize.width, imageNaturalSize.height) * 0.8;
      setCropData({
        x: (imageNaturalSize.width - cropSize) / 2,
        y: (imageNaturalSize.height - cropSize) / 2,
        width: cropSize,
        height: cropSize
      });
    }
  };
  
  // Render crop tool
  if (showCropTool && previewUrl) {
    return (
      <div className={styles.cropTool}>
        <div className={styles.cropHeader}>
          <h4>Crop & Resize Logo</h4>
          <p>Adjust the crop area to select the portion of your logo you want to use</p>
        </div>
        
        <div className={styles.cropContainer}>
          <div className={styles.imageContainer}>
            <img
              ref={imageRef}
              src={previewUrl}
              alt="Logo preview"
              onLoad={handleImageLoad}
              className={styles.cropImage}
            />
            
            {/* Crop overlay */}
            <div 
              className={styles.cropOverlay}
              style={{
                left: `${(cropData.x / imageNaturalSize.width) * 100}%`,
                top: `${(cropData.y / imageNaturalSize.height) * 100}%`,
                width: `${(cropData.width / imageNaturalSize.width) * 100}%`,
                height: `${(cropData.height / imageNaturalSize.height) * 100}%`
              }}
            >
              <div className={styles.cropBorder} />
            </div>
          </div>
          
          <div className={styles.cropControls}>
            <div className={styles.presetRatios}>
              <button
                className={styles.ratioButton}
                onClick={() => {
                  const size = Math.min(imageNaturalSize.width, imageNaturalSize.height);
                  handleCropChange({
                    width: size,
                    height: size,
                    x: (imageNaturalSize.width - size) / 2,
                    y: (imageNaturalSize.height - size) / 2
                  });
                }}
              >
                Square (1:1)
              </button>
              <button
                className={styles.ratioButton}
                onClick={() => {
                  const height = imageNaturalSize.height * 0.3;
                  const width = height * 3;
                  handleCropChange({
                    width: Math.min(width, imageNaturalSize.width),
                    height: height,
                    x: (imageNaturalSize.width - Math.min(width, imageNaturalSize.width)) / 2,
                    y: (imageNaturalSize.height - height) / 2
                  });
                }}
              >
                Logo (3:1)
              </button>
              <button
                className={styles.ratioButton}
                onClick={() => {
                  const height = imageNaturalSize.height * 0.25;
                  const width = height * 4;
                  handleCropChange({
                    width: Math.min(width, imageNaturalSize.width),
                    height: height,
                    x: (imageNaturalSize.width - Math.min(width, imageNaturalSize.width)) / 2,
                    y: (imageNaturalSize.height - height) / 2
                  });
                }}
              >
                Wide (4:1)
              </button>
            </div>
            
            <div className={styles.cropInfo}>
              <span>Crop Size: {Math.round(cropData.width)} × {Math.round(cropData.height)}px</span>
            </div>
          </div>
        </div>
        
        <div className={styles.cropActions}>
          <button className={styles.cancelButton} onClick={cancelCrop}>
            <X size={16} />
            Cancel
          </button>
          <button className={styles.resetButton} onClick={resetCrop}>
            <RotateCcw size={16} />
            Reset
          </button>
          <button 
            className={styles.applyButton} 
            onClick={applyCrop}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className={styles.spinner} />
                Processing...
              </>
            ) : (
              <>
                <Check size={16} />
                Apply Crop
              </>
            )}
          </button>
        </div>
      </div>
    );
  }
  
  // Render current logo or upload area
  return (
    <div className={styles.logoUploader}>
      {currentLogo ? (
        <div className={styles.currentLogo}>
          <div className={styles.logoPreview}>
            <img src={currentLogo.url} alt="Current logo" className={styles.logoImage} />
          </div>
          <div className={styles.logoInfo}>
            <p className={styles.logoMeta}>
              Size: {currentLogo.size} • Alignment: {currentLogo.alignment}
              {currentLogo.width && currentLogo.height && (
                <> • {currentLogo.width}×{currentLogo.height}px</>
              )}
            </p>
          </div>
          <div className={styles.logoActions}>
            <button 
              className={styles.changeButton}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              Change Logo
            </button>
            <button 
              className={styles.removeButton}
              onClick={onLogoRemove}
            >
              <X size={16} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div 
          className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.uploadContent}>
            <div className={styles.uploadIcon}>
              <ImageIcon size={32} />
            </div>
            <h4 className={styles.uploadTitle}>Add Your Logo</h4>
            <p className={styles.uploadDescription}>
              Drag and drop an image here, or click to browse
            </p>
            <div className={styles.uploadSpecs}>
              <span>PNG, JPG, SVG up to 5MB</span>
            </div>
            <button className={styles.browseButton}>
              <Upload size={16} />
              Browse Files
            </button>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
      />
    </div>
  );
};