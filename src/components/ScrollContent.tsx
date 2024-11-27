import { useEffect, useRef } from "react";

const MyInput = () => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const visualViewport = window.visualViewport;

    if (!visualViewport) return;

    visualViewport.addEventListener("scroll", () => {
      ref?.current?.blur();
    });
  }, []);
  return (
    <input
      ref={ref}
      type="text"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      placeholder="Type something..."
      className="w-full p-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
    />
  );
};

export const ScrollContent = () => {
  return (
    <div className="pt-40 px-4 pb-8">
      <div className="max-w-2xl mx-auto mb-8"></div>
      <MyInput />
      {[...Array(20)].map((_, index) => (
        <div key={index} className="max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold mb-4">Section {index + 1}</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
          <input
            type="text"
            placeholder="Type something..."
            className="w-full p-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      ))}
    </div>
  );
};
