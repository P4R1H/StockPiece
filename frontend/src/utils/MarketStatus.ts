/*
export type MarketStatus = 'open' | 'closed' | 'updating';

export interface MarketStatusInfo {
  status: MarketStatus;
  nextStatus: MarketStatus;
  timeUntilNext: string;
}

export function getMarketStatusInfo(): MarketStatusInfo {
  const now = new Date();
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  
  // JS getDay(): 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  const day = istTime.getDay();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const boundary = 23 * 60 + 59; // 11:59 PM = 1439 minutes

  let status: MarketStatus = 'closed';
  let nextStatus: MarketStatus = 'open';
  let timeUntilNext: string;

  // Open period: from Thursday 11:59 PM to Monday 11:59 PM
  if (
    (day === 4 && currentMinutes >= boundary) ||
    day === 5 ||
    day === 6 ||
    day === 0 ||
    (day === 1 && currentMinutes < boundary)
  ) {
    status = 'open';
    nextStatus = 'updating';
    
    // Calculate time until updating
    if (day === 1) {
      // On Monday, time until end of day
      timeUntilNext = `${boundary - currentMinutes}`;  // Return just the minutes
    } else {
      // Calculate days until Monday
      const daysUntilMonday = day === 0 ? 1 : 8 - day;
      timeUntilNext = `${daysUntilMonday * 1440}`;  // Convert days to minutes
    }
  }
  // Updating period: from Monday 11:59 PM to Tuesday 11:59 PM
  else if (
    (day === 1 && currentMinutes >= boundary) ||
    (day === 2 && currentMinutes < boundary)
  ) {
    status = 'updating';
    nextStatus = 'closed';
    
    // Calculate time until closed
    if (day === 2) {
      // On Tuesday, time until end of day
      timeUntilNext = `${boundary - currentMinutes}`;  // Return just the minutes
    } else {
      timeUntilNext = `${1440}`;  // Convert days to minutes
    }
  }
  // Closed period: from Tuesday 11:59 PM to Thursday 11:59 PM
  else {
    status = 'closed';
    nextStatus = 'open';
    
    // Calculate time until open
    if (day === 4) {
      // On Thursday, time until end of day
      timeUntilNext = `${boundary - currentMinutes}`;  // Return just the minutes
    } else {
      // Calculate days until Thursday
      const daysUntilThursday = day === 3 ? 1 : 4 - day;
      timeUntilNext = `${daysUntilThursday * 1440}`;  // Convert days to minutes
    }
  }

  return { status, nextStatus, timeUntilNext };
}
*/

// src/utils/marketStatus.ts
export type MarketStatus = 'open' | 'closed' | 'updating';

export interface MarketStatusInfo {
  status: MarketStatus;
  nextStatus: MarketStatus;
  timeUntilNext: string;
}

export function getMarketStatusInfo(): MarketStatusInfo {
  const now = new Date();
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  
  // JS getDay(): 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  const day = istTime.getDay();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const boundary = 23 * 60 + 59; // 11:59 PM = 1439 minutes
  
  // TEMPORARY CHANGE: Market opens next Thursday instead of this Thursday
  // Today's date for comparison
  const today = new Date();
  const nextThursday = new Date("March 20, 2025"); // Set the next Thursday date here

  let status: MarketStatus = 'closed';
  let nextStatus: MarketStatus = 'open';
  let timeUntilNext: string;

  // Force closed status until next Thursday
  if (today < nextThursday) {
    status = 'closed';
    nextStatus = 'open';
    
    // Calculate minutes until next Thursday at 11:59 PM
    const diffTime = nextThursday.getTime() - today.getTime();
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    timeUntilNext = `${diffMinutes}`;
    
    return { status, nextStatus, timeUntilNext };
  }

  // Regular logic for after next Thursday
  // Open period: from Thursday 11:59 PM to Monday 11:59 PM
  if (
    (day === 4 && currentMinutes >= boundary) ||
    day === 5 ||
    day === 6 ||
    day === 0 ||
    (day === 1 && currentMinutes < boundary)
  ) {
    status = 'open';
    nextStatus = 'updating';
    
    // Calculate time until updating
    if (day === 1) {
      // On Monday, time until end of day
      timeUntilNext = `${boundary - currentMinutes}`;  // Return just the minutes
    } else {
      // Calculate days until Monday
      const daysUntilMonday = day === 0 ? 1 : 8 - day;
      timeUntilNext = `${daysUntilMonday * 1440}`;  // Convert days to minutes
    }
  }
  // Updating period: from Monday 11:59 PM to Tuesday 11:59 PM
  else if (
    (day === 1 && currentMinutes >= boundary) ||
    (day === 2 && currentMinutes < boundary)
  ) {
    status = 'updating';
    nextStatus = 'closed';
    
    // Calculate time until closed
    if (day === 2) {
      // On Tuesday, time until end of day
      timeUntilNext = `${boundary - currentMinutes}`;  // Return just the minutes
    } else {
      timeUntilNext = `${1440}`;  // Convert days to minutes
    }
  }
  // Closed period: from Tuesday 11:59 PM to Thursday 11:59 PM
  else {
    status = 'closed';
    nextStatus = 'open';
    
    // Calculate time until open
    if (day === 4) {
      // On Thursday, time until end of day
      timeUntilNext = `${boundary - currentMinutes}`;  // Return just the minutes
    } else {
      // Calculate days until Thursday
      const daysUntilThursday = day === 3 ? 1 : 4 - day;
      timeUntilNext = `${daysUntilThursday * 1440}`;  // Convert days to minutes
    }
  }

  return { status, nextStatus, timeUntilNext };
}