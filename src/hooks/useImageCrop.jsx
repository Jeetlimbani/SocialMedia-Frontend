import { useState, useCallback } from "react";

export const useImageCrop = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const resetCrop = useCallback(() => {
    setImageSrc(null);
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
      aspect: 1,
    });
    setCompletedCrop(null);
    setScale(1);
    setRotate(0);
  }, []); // No dependencies, as it only uses setState functions, which are stable

  const loadImage = useCallback((file) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || '');
    });
    reader.readAsDataURL(file);
  }, []); // No dependencies, as it only uses setImageSrc, which is stable

  return {
    imageSrc,
    setImageSrc,
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    scale,
    setScale,
    rotate,
    setRotate,
    resetCrop,
    loadImage,
  };
};