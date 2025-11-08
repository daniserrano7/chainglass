/**
 * Formats a number as USD currency
 */
export function formatUSD(value: number | null): string {
  if (value === null || value === undefined) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a token balance with appropriate precision
 */
export function formatTokenBalance(balance: string | number, maxDecimals: number = 6): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;

  if (isNaN(num) || num === 0) {
    return '0';
  }

  // For very small numbers, use scientific notation
  if (num < 0.000001) {
    return num.toExponential(2);
  }

  // For small numbers, show more decimals
  if (num < 1) {
    return num.toFixed(maxDecimals);
  }

  // For larger numbers, show fewer decimals
  if (num >= 1000) {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Formats a large number with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Formats USD with compact notation for large values
 */
export function formatCompactUSD(value: number | null): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (value >= 1_000_000) {
    return `$${formatCompactNumber(value)}`;
  }

  return formatUSD(value);
}

/**
 * Formats a percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Truncates a string in the middle (useful for addresses)
 */
export function truncateMiddle(str: string, startChars: number = 6, endChars: number = 4): string {
  if (str.length <= startChars + endChars) {
    return str;
  }
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}

/**
 * Formats a timestamp as a relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

/**
 * Formats a timestamp as a date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
