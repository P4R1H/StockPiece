"use client";

import { Toaster as Sonner, toast } from "sonner";
import { useEffect, useState } from "react";
import "./CustomSonner.css";
import { Clock } from 'lucide-react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

interface MarketStatusToastOptions {
  status: string;
  nextStatus: string;
  timeUntilNext: string;
  statusClass: Record<string, string>;
}

const Toaster = ({ ...props }: ToasterProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        duration: 3500,
      }}
      {...props}
    />
  );
};

export const toastMarketStatus = ({
  status,
  nextStatus,
  timeUntilNext,
  statusClass,
}: MarketStatusToastOptions) => {
  toast(
    <div className="market-status-toast-content">
      <div className="market-status-message">
        The market is currently{" "}
        <span className={`market-status ${statusClass[status]}`}>
          {status.toUpperCase()}
        </span> 
        &nbsp;.  It will{" "}
        <span className={`market-status ${statusClass[nextStatus]}`}>
          {nextStatus.toUpperCase() === 'UPDATING' ? 'UPDATE' : nextStatus.toUpperCase()}
        </span> again
        {" "}in{" "}
        <span className="time-until">
          {timeUntilNext}.
        </span>
      </div>
    </div>,
    {
      className: "group toast pirate-toast market-status-toast",
      duration: 3500,
      id: "market-status",
      icon: <Clock size={20} />
    }
  );
};

export { Toaster };