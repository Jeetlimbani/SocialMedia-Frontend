// components/ImageCropDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Crop as CropIcon } from '@mui/icons-material';
import ReactCrop from 'react-image-crop';

const ImageCropDialog = ({
  open,
  onClose,
  imageSrc,
  crop,
  setCrop,
  completedCrop,
  setCompletedCrop,
  imgRef,
  previewCanvasRef,
  scale,
  rotate,
  onImageLoad,
  onCropComplete,
  isUploadingAvatar,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CropIcon />
          Crop Your Avatar
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Boolean(imageSrc) && (
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
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          )}
          
          {Boolean(completedCrop) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview
                </Typography>
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    border: '1px solid black',
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
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onCropComplete}
          variant="contained"
          disabled={isUploadingAvatar || !completedCrop?.width || !completedCrop?.height}
        >
          {isUploadingAvatar ? (
            <CircularProgress size={20} color="inherit" />
          ) : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropDialog;