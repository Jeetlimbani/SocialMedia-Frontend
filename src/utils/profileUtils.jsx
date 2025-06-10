// utils/profileUtils.js

/**
 * Utility function to get the full avatar URL
 */
export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    
    const baseUrl = import.meta.env?.VITE_API_URL || 
                    (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : null) || 
                    'http://localhost:4000';
    return `${baseUrl}${avatarPath}`;
  };
  
  /**
   * Utility function to center aspect crop
   */
  export const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return {
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
      aspect,
    };
  };
  
  /**
   * Canvas preview utility for image cropping
   */
  export const canvasPreview = (
    image,
    canvas,
    crop,
    scale = 1,
    rotate = 0,
  ) => {
    const ctx = canvas.getContext('2d');
  
    if (!ctx) {
      throw new Error('No 2d context');
    }
  
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
  
  /**
   * Format date for display
   */
  export const formatPostDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  /**
   * Handle post interactions
   */
  export const createPostHandler = (action) => (postId) => {
    console.log(`${action} post:`, postId);
    // Add your actual post interaction logic here
  };
  
  /**
   * Validate profile form data
   */
  export const validateProfileData = (formData) => {
    const errors = {};
    
    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };