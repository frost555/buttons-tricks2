import { debounce } from "lodash-es";
import { useEffect, useState } from "react";

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

    // Debounce the handleResize function
    const debouncedHandleResize = debounce(handleResize, 100); // 100ms debounce time

    visualViewport.addEventListener("resize", debouncedHandleResize);
    visualViewport.addEventListener("scroll", debouncedHandleResize);

    // Initial values
    handleResize();

    return () => {
      visualViewport.removeEventListener("resize", debouncedHandleResize);
      visualViewport.removeEventListener("scroll", debouncedHandleResize);
    };
  }, []);

  return viewport;
};
