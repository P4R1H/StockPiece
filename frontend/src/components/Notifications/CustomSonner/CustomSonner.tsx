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
  const formatTimeDisplay = (timeStr: string) => {    
    const minutes = parseInt(timeStr, 10);
    if (isNaN(minutes)) return timeStr; 
    
    // Calculate days, hours, minutes
    if (minutes >= 1440) { // 24 hours * 60 minutes
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingHours === 0 && remainingMinutes === 0) {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      } else if (remainingMinutes === 0) {
        return `${days} ${days === 1 ? 'day' : 'days'} and ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
      } else if (remainingHours === 0) {
        return `${days} ${days === 1 ? 'day' : 'days'} and ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
      } else {
        return `${days} ${days === 1 ? 'day' : 'days'}, ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'} and ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
      }
    } else if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (remainingMinutes === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
      }
    } else {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }
  };

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
          {formatTimeDisplay(timeUntilNext)}.
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