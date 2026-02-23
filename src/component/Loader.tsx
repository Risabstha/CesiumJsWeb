import React from "react";

interface SimpleLoaderProps {
  /** Optional className for customization */
  className?: string;
  /** Loading message (default: "LOADING 3D TERRAIN") */
  message?: string;
}

export const SimpleLoader: React.FC<SimpleLoaderProps> = ({
  className = "",
  message = "LOADING 3D TERRAIN",
}) => {


  return (
    <div
      className={`flex flex-col items-center justify-center w-screen min-h-screen ${className}`}
    >
      <div className="text-center space-y-8 p-8 w-full ">
        {/* Simple spinner */}
        {/* <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-gray-600/30" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div> */}

        {/* Loading text with pulse animation */}
        <h1 className="text-xl md:text-3xl font-light tracking-widest text-white animate-pulse">
          {message}
        </h1>
        {/* Simple terrain indicator (3 small peaks) */}
        <div className="flex justify-center items-end space-x-2 h-12">
          <div className="w-4 bg-blue-400/50 rounded-t animate-bounce" style={{ height: "24px", animationDelay: "0s" }} />
          <div className="w-4 bg-blue-500 rounded-t animate-bounce" style={{ height: "32px", animationDelay: "0.1s" }} />
          <div className="w-4 bg-blue-400/50 rounded-t animate-bounce" style={{ height: "20px", animationDelay: "0.2s" }} />
        </div>
        <div className="text-white/70 md:text-sm text-xs mt-4">If taking too long, please refresh the page</div>
      </div>
    </div>
  );
};

export default SimpleLoader;