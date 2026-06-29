import { Location } from '../types';

export const formatLocation = (location?: Location): string => {
  if (!location) return '';
  const parts = [location.address, location.area, location.city, location.state, location.zipCode].filter(Boolean);
  return parts.join(', ');
};

export const formatBudget = (amount?: number): string => {
  if (amount == null) return 'Not set';
  return `₹${amount.toLocaleString()}/mo`;
};
