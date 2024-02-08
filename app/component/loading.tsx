// LoadingComponent.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import yourLogo from '../OPI copy png.png'; // Make sure the path is correct

const LoadingComponent: React.FC = () => {
  const [progress, setProgress] = useState(10); // Start with 10% to make sure the logo is visible initially

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          // You might want to handle the completion of loading here
        }
        return Math.min(newProgress, 100); // Ensure progress doesn't exceed 100%
      });
    }, 200); // Adjust time interval as needed
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        className="w-48 h-48" // Adjust the size of the logo container
        animate={{ rotate: 360 }}
        transition={{ duration: 2, loop: Infinity, ease: "linear" }}
        style={{
          filter: `opacity(${progress}%)`, // Change opacity based on loading progress
          // You can also add other CSS properties to reflect the progress (e.g., color, brightness)
        }}
      >
        <Image src={yourLogo} alt="Loading..." width={192} height={192} className="object-cover" />
      </motion.div>
    </div>
  );
};

export default LoadingComponent;
