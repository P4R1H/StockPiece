"use client";

import { Toaster as Sonner, toast } from "sonner";
import { useEffect, useState } from "react";
import "./CustomSonner.css";
import { Clock } from 'lucide-react';

// Define detailed type interfaces
type ToasterProps = React.ComponentProps<typeof Sonner>;

interface MarketStatusToastOptions {
  status: string;
  nextStatus: string;
  timeUntilNext: string;
  statusClass: Record<string, string>;
}

interface TimeBreakdown {
  days: number;
  hours: number;
  minutes: number;
}

// Hook for detecting mobile screens
const useIsMobileScreen = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  useEffect(() => {
    const checkIfMobile = (): void => {
      const mobileBreakpoint: number = 768;
      const currentScreenWidth: number = window.innerWidth;
      setIsMobile(currentScreenWidth <= mobileBreakpoint);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return isMobile;
};

// Time formatting utilities
const calculateTimeBreakdown = (totalMinutes: number): TimeBreakdown => {
  const minutesPerDay: number = 1440; // 24 hours * 60 minutes
  const minutesPerHour: number = 60;

  const days: number = Math.floor(totalMinutes / minutesPerDay);
  const remainingMinutesAfterDays: number = totalMinutes % minutesPerDay;
  const hours: number = Math.floor(remainingMinutesAfterDays / minutesPerHour);
  const minutes: number = remainingMinutesAfterDays % minutesPerHour;

  return { days, hours, minutes };
};

const pluralize = (value: number, singular: string, plural: string): string => {
  return `${value} ${value === 1 ? singular : plural}`;
};

const formatTimeComponents = (timeBreakdown: TimeBreakdown): string => {
  const { days, hours, minutes } = timeBreakdown;

  if (days > 0) {
    const daysString = pluralize(days, 'day', 'days');
    if (hours === 0 && minutes === 0) return daysString;
    if (minutes === 0) return `${daysString} and ${pluralize(hours, 'hour', 'hours')}`;
    if (hours === 0) return `${daysString} and ${pluralize(minutes, 'minute', 'minutes')}`;
    return `${daysString}, ${pluralize(hours, 'hour', 'hours')} and ${pluralize(minutes, 'minute', 'minutes')}`;
  }

  if (hours > 0) {
    if (minutes === 0) return pluralize(hours, 'hour', 'hours');
    return `${pluralize(hours, 'hour', 'hours')} and ${pluralize(minutes, 'minute', 'minutes')}`;
  }

  return pluralize(minutes, 'minute', 'minutes');
};

const formatTimeDisplay = (timeStr: string): string => {
  const parsedMinutes: number = parseInt(timeStr, 10);
  
  if (isNaN(parsedMinutes)) {
    return timeStr;
  }

  const timeBreakdown: TimeBreakdown = calculateTimeBreakdown(parsedMinutes);
  return formatTimeComponents(timeBreakdown);
};

const formatMarketStatus = (status: string): string => {
  if (status.toUpperCase() === 'UPDATING') return 'UPDATE';
  if (status.toUpperCase() === 'CLOSED') return 'CLOSE';
  return status.toUpperCase();
};

// Main Toaster component
const Toaster = ({ ...props }: ToasterProps): JSX.Element => {
  const isMobile: boolean = useIsMobileScreen();

  const toasterClassNames = {
    toast: "group toast pirate-toast",
    description: "group-[.toast]:text-brown",
    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
    cancelButton: "group-[.toast]:bg-gray-200 group-[.toast]:text-brown",
  };

  return (
    <Sonner
      className="toaster group"
      position={isMobile ? "top-center" : "bottom-right"}
      toastOptions={{
        classNames: toasterClassNames,
        duration: 3500,
      }}
      {...props}
    />
  );
};

// Market status toast function
export const toastMarketStatus = ({
  status,
  nextStatus,
  timeUntilNext,
  statusClass,
}: MarketStatusToastOptions): void => {
  const formattedTime: string = formatTimeDisplay(timeUntilNext);
  const formattedNextStatus: string = formatMarketStatus(nextStatus);
  
  const ToastContent = (): JSX.Element => (
    <div className="market-status-toast-content">
      <div className="market-status-message">
        The market is currently{" "}
        <span className={`market-status ${statusClass[status]}`}>
          {status.toUpperCase()}
        </span>
         . It will{" "}
        <span className={`market-status ${statusClass[nextStatus]}`}>
          {formattedNextStatus}
        </span>
        {" "}again in{" "}
        <span className="time-until">
          {formattedTime}.
        </span>
      </div>
    </div>
  );

  const toastOptions = {
    className: "group toast pirate-toast market-status-toast",
    duration: 3500,
    id: "market-status",
    icon: <Clock size={20} />
  };

  toast(<ToastContent />, toastOptions);
};

export { Toaster };