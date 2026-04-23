/**
 * FairGig Pakistan Localization Utilities
 * Handles PKR currency formatting, date formatting, and Pakistani-specific content
 */

export const CURRENCY = {
  symbol: 'Rs',
  code: 'PKR',
  decimals: 2,
};

export const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Mirpur Khas',
];

export const PLATFORMS_PAKISTAN = {
  foodpanda: { name: 'Foodpanda', emoji: '🍔', category: 'delivery' },
  daraz: { name: 'Daraz', emoji: '📦', category: 'delivery' },
  careem: { name: 'Careem', emoji: '🚗', category: 'ride_hailing' },
  uber: { name: 'Uber', emoji: '🚕', category: 'ride_hailing' },
  jazzcash_rides: { name: 'JazzCash Rides', emoji: '🛵', category: 'ride_hailing' },
  upwork: { name: 'Upwork', emoji: '💻', category: 'freelance' },
  fiverr: { name: 'Fiverr', emoji: '⭐', category: 'freelance' },
  daraz_domestic: { name: 'Daraz Domestic', emoji: '🏠', category: 'domestic' },
};

/**
 * Format amount as Pakistani Rupees
 * @param amount - Amount in PKR
 * @returns Formatted string (e.g., "Rs 1,234.50")
 */
export function formatPKR(amount: number): string {
  return `${CURRENCY.symbol} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format amount as compact Pakistani Rupees for charts/summaries
 * @param amount - Amount in PKR
 * @returns Compact formatted string (e.g., "Rs 1.2K")
 */
export function formatPKRCompact(amount: number): string {
  if (amount >= 1000000) {
    return `${CURRENCY.symbol} ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${CURRENCY.symbol} ${(amount / 1000).toFixed(1)}K`;
  }
  return formatPKR(amount);
}

/**
 * Format hourly rate with PKR/hour notation
 */
export function formatHourlyRate(rate: number): string {
  return `${CURRENCY.symbol} ${rate.toFixed(0)}/hr`;
}

/**
 * Format date in Pakistani format (DD-MMM-YYYY)
 */
export function formatDatePK(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date and time in Pakistani format
 */
export function formatDateTimePK(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get platform info with emoji and category
 */
export function getPlatformInfo(platformKey: string): (typeof PLATFORMS_PAKISTAN)[keyof typeof PLATFORMS_PAKISTAN] | null {
  const key = platformKey.toLowerCase().replace(/[- ]/g, '_') as keyof typeof PLATFORMS_PAKISTAN;
  return PLATFORMS_PAKISTAN[key] || null;
}

/**
 * Calculate earnings statistics for display
 */
export function calculateEarningsStats(shifts: any[]) {
  if (shifts.length === 0) {
    return {
      totalEarnings: 0,
      totalNetEarnings: 0,
      totalHours: 0,
      averageHourlyRate: 0,
      averageCommissionRate: 0,
    };
  }

  const totalEarnings = shifts.reduce((sum, s) => sum + (s.gross_earnings || 0), 0);
  const totalNetEarnings = shifts.reduce((sum, s) => sum + (s.net_earnings || 0), 0);
  const totalHours = shifts.reduce((sum, s) => sum + (s.duration_hours || 0), 0);
  const totalFees = shifts.reduce((sum, s) => sum + (s.platform_fees || 0), 0);

  return {
    totalEarnings,
    totalNetEarnings,
    totalHours: parseFloat(totalHours.toFixed(2)),
    averageHourlyRate: totalHours > 0 ? totalNetEarnings / totalHours : 0,
    averageCommissionRate: totalEarnings > 0 ? (totalFees / totalEarnings) * 100 : 0,
  };
}

/**
 * Get city-wide comparison metrics with proper formatting
 */
export function formatCityComparison(workerRate: number, cityMedian: number): {
  difference: number;
  percentage: number;
  status: 'above' | 'below' | 'equal';
  label: string;
} {
  const difference = workerRate - cityMedian;
  const percentage = (difference / cityMedian) * 100;

  return {
    difference,
    percentage,
    status: difference > 0 ? 'above' : difference < 0 ? 'below' : 'equal',
    label:
      difference > 0
        ? `${percentage.toFixed(1)}% above city median`
        : difference < 0
          ? `${Math.abs(percentage).toFixed(1)}% below city median`
          : 'At city median',
  };
}

/**
 * Localized status badges
 */
export const STATUS_LABELS = {
  verified: { label: 'Verified', color: 'bg-green-100 text-green-700' },
  logged: { label: 'Logged', color: 'bg-blue-100 text-blue-700' },
  flagged: { label: 'Flagged', color: 'bg-red-100 text-red-700' },
  unverifiable: { label: 'Unverifiable', color: 'bg-gray-100 text-gray-700' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-700' },
  escalated: { label: 'Escalated', color: 'bg-orange-100 text-orange-700' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700' },
  open: { label: 'Open', color: 'bg-red-100 text-red-700' },
};

/**
 * Get localized greeting based on time
 */
export function getGreetingMessage(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'صبح بخیر'; // Good morning in Urdu
  if (hour < 17) return 'دوپہر بخیر'; // Good afternoon in Urdu
  return 'شام بخیر'; // Good evening in Urdu
}

/**
 * Convert to/from USD for reference (approximate rates)
 */
export const EXCHANGE_RATE = {
  USD_TO_PKR: 275, // Approximate rate
  PKR_TO_USD: 1 / 275,
};

export function formatUSDEquivalent(pkr: number): string {
  const usd = pkr * EXCHANGE_RATE.PKR_TO_USD;
  return `≈ $${usd.toFixed(2)} USD`;
}
