import React, { useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Crop as CropIcon } from "@mui/icons-material";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useImageCrop } from '../../hooks/useImageCrop';

const AvatarCropDialog = ({ open, onClose, onUpload, isUploading }) => {
  const {
    imageSrc,
    setImageSrc,
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    scale,
    rotate,
    resetCrop,
    loadImage,
  } = useImageCrop();
  
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasTriggeredFileInput = useRef(false);

  // Helper function to draw image on canvas for preview
  const canvasPreview = (image, canvas, crop, scale = 1, rotate = 0) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) { throw new Error('No 2d context'); }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const rotateRads = rotate * (Math.PI / 180);
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );
    ctx.restore();
  };

  // Callback to center the crop area
  const centerAspectCrop = useCallback((mediaWidth, mediaHeight, aspect) => {
    return {
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
      aspect,
    };
  }, []);

  // Callback when the image loaded into ReactCrop
  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
    console.log('[AvatarCropDialog] Image loaded into ReactCrop.');
  };

  // Effect to draw the cropped preview on canvas
  useEffect(() => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      canvasPreview(
        imgRef.current,
        previewCanvasRef.current,
        completedCrop,
        scale,
        rotate,
      );
    }
  }, [completedCrop, scale, rotate]);

  // Effect to handle dialog opening/closing and cleanup
  useEffect(() => {
    if (open) {
      console.log('[AvatarCropDialog] Dialog opened');
      hasTriggeredFileInput.current = false; // Reset trigger flag when dialog opens
    } else {
      console.log('[AvatarCropDialog] Dialog closed - cleaning up');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      resetCrop();
      hasTriggeredFileInput.current = false; // Ensure reset on close
    }
  }, [open, resetCrop]);

  // Effect to trigger file input when dialog opens and no image is loaded
  useEffect(() => {
    if (open && !imageSrc && !hasTriggeredFileInput.current && fileInputRef.current) {
      console.log('[AvatarCropDialog] Triggering file input on dialog open');
      hasTriggeredFileInput.current = true;
      // Minimal delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        if (fileInputRef.current && open) {
          fileInputRef.current.click();
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [open, imageSrc]);

  // Handles the "Upload" button click after cropping
  const handleCropComplete = async () => {
    console.log('[AvatarCropDialog] handleCropComplete called.');
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      previewCanvasRef.current.toBlob((blob) => {
        if (!blob) {
          console.error('[AvatarCropDialog] Failed to create blob from canvas.');
          return;
        }
        onUpload(blob);
        console.log('[AvatarCropDialog] Blob created and sent to onUpload.');
      }, 'image/jpeg');
    }
  };

  // Internal handler for closing the dialog
  const handleCloseInternal = useCallback(() => {
    console.log('[AvatarCropDialog] handleCloseInternal called.');
    
    // Clean up file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset image crop state
    resetCrop();
    
    // Close dialog
    onClose();
  }, [resetCrop, onClose]);

  // Handles the file input's change event
  const handleFileInputChange = useCallback((e) => {
    console.log(`[AvatarCropDialog] File input changed. Files: ${e.target.files?.length || 0}`);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(`[AvatarCropDialog] Loading file: ${file.name}`);
      loadImage(file);
    } else {
      console.log('[AvatarCropDialog] No file selected or user cancelled');
      handleCloseInternal();
    }
  }, [loadImage, handleCloseInternal]);

  // Manual file selection handler
  const handleManualFileSelect = () => {
    if (fileInputRef.current) {
      console.log('[AvatarCropDialog] Manual file select triggered');
      hasTriggeredFileInput.current = true; // Prevent automatic trigger after manual selection
      fileInputRef.current.click();
    }
  };

  return (
    <>
      {/* Hidden file input element */}
      <input
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        type="file"
        onChange={handleFileInputChange}
      />
      
      {/* MUI Dialog component */}
      <Dialog 
        open={open} 
        onClose={handleCloseInternal} 
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={!!imageSrc} // Allow escape only when no image is loaded
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CropIcon />
            Crop Your Avatar
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            {imageSrc ? (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={50}
                minHeight={50}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imageSrc}
                  style={{ 
                    transform: `scale(${scale}) rotate(${rotate}deg)`, 
                    maxWidth: '100%', 
                    height: 'auto' 
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            ) : (
              <Box sx={{ 
                minHeight: 200, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '100%',
                gap: 2
              }}>
                <Typography variant="body1" color="textSecondary">
                  Select an image to crop for your avatar
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={handleManualFileSelect}
                  disabled={isUploading || hasTriggeredFileInput.current} // Disable after initial trigger
                >
                  Choose File
                </Button>
              </Box>
            )}
            
            {completedCrop?.width && completedCrop?.height && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview
                  </Typography>
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      border: '1px solid #ccc',
                      objectFit: 'contain',
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInternal} disabled={isUploading}>
            Cancel
          </Button>
          {imageSrc && (
            <Button 
              variant="outlined"
              onClick={handleManualFileSelect}
              disabled={isUploading}
            >
              Choose Different File
            </Button>
          )}
          <Button 
            onClick={handleCropComplete}
            variant="contained"
            disabled={isUploading || !completedCrop?.width || !completedCrop?.height} 
          >
            {isUploading ? <CircularProgress size={20} color="inherit" /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AvatarCropDialog;