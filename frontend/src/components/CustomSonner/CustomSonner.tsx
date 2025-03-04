"use client"

import { Toaster as Sonner } from "sonner"
import { useEffect, useState } from "react"
import "./CustomSonner.css"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <Sonner
      className="toaster group"
      position={isMobile ? "top-center" : "bottom-right"}
      toastOptions={{
        classNames: {
          toast: "group toast pirate-toast",
          description: "group-[.toast]:text-brown",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-gray-200 group-[.toast]:text-brown",
        },
        duration: 5000, // Changed to 5 seconds (5000ms)
      }}
      {...props}
    />
  )
}

export { Toaster }