import { useVisualViewport } from "../hooks/useVisualViewport";

export const NotificationBar = () => {
  const viewport = useVisualViewport();

  return (
    <div
      style={{
        top: 100 + viewport.offsetTop,
        transition: "top 200ms ease-in-out",
      }}
      className="fixed left-0 right-0 bg-yellow-500 text-white p-4 shadow-lg z-50"
    >
      <div className="max-w-2xl mx-auto">
        <p className="text-center font-semibold mb-2">
          Important Notification at Top 100px
        </p>
        <div className="bg-yellow-600 rounded p-2 text-sm">
          <p>Viewport Properties:</p>
          <ul className="grid grid-cols-2 gap-2">
            <li>Height: {viewport.height.toFixed(2)}px</li>
            <li>Width: {viewport.width.toFixed(2)}px</li>
            <li>Offset Left: {viewport.offsetLeft.toFixed(2)}px</li>
            <li>Offset Top: {viewport.offsetTop.toFixed(2)}px</li>
            <li>Page Left: {viewport.pageLeft.toFixed(2)}px</li>
            <li>Page Top: {viewport.pageTop.toFixed(2)}px</li>
            <li>Scale: {viewport.scale.toFixed(2)}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
