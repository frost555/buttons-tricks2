import { useState, useEffect } from 'react';

interface ViewportState {
  height: number;
  width: number;
  offsetLeft: number;
  offsetTop: number;
  pageLeft: number;
  pageTop: number;
  scale: number;
}

export const useVisualViewport = () => {
  const [viewport, setViewport] = useState<ViewportState>({
    height: window.innerHeight,
    width: window.innerWidth,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1,
  });

  useEffect(() => {
    const visualViewport = window.visualViewport;
    
    if (!visualViewport) return;

    const handleResize = () => {
      setViewport({
        height: visualViewport.height,
        width: visualViewport.width,
        offsetLeft: visualViewport.offsetLeft,
        offsetTop: visualViewport.offsetTop,
        pageLeft: visualViewport.pageLeft,
        pageTop: visualViewport.pageTop,
        scale: visualViewport.scale,
      });
    };

    visualViewport.addEventListener('resize', handleResize);
    visualViewport.addEventListener('scroll', handleResize);

    // Initial values
    handleResize();

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleResize);
    };
  }, []);

  return viewport;
};