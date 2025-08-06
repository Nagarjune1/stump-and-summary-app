
import React from 'react';
import { SelectItem } from '@/components/ui/select';

interface SafeSelectItemProps {
  value: any;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

const SafeSelectItem: React.FC<SafeSelectItemProps> = ({ 
  value, 
  children, 
  className,
  disabled,
  ...props 
}) => {
  // Create absolutely safe value with multiple fallback mechanisms
  const createSafeValue = (inputValue: any): string => {
    // Handle null/undefined immediately
    if (inputValue === null || inputValue === undefined) {
      return `safe_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;
    }

    let stringValue: string;
    
    // Convert to string safely
    try {
      stringValue = String(inputValue);
    } catch (error) {
      console.error('SafeSelectItem: Failed to convert value to string:', error);
      return `error_${Date.now()}_${Math.random().toString(36).substr(2, 10)}`;
    }

    // Trim whitespace
    stringValue = stringValue.trim();

    // Check for empty or invalid values with comprehensive validation
    if (
      stringValue === '' ||
      stringValue.length === 0 ||
      stringValue === 'null' ||
      stringValue === 'undefined' ||
      stringValue === 'NaN' ||
      /^\s*$/.test(stringValue) ||
      typeof stringValue !== 'string'
    ) {
      console.warn('SafeSelectItem: Empty/invalid value detected, creating fallback:', inputValue);
      return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    }

    // Final safety check
    if (!stringValue || stringValue.trim().length === 0) {
      console.error('SafeSelectItem: Final validation failed, using emergency fallback');
      return `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
    }

    return stringValue;
  };

  const safeValue = createSafeValue(value);

  // Absolutely final check - if somehow we still have an empty string, don't render
  if (!safeValue || safeValue === '' || safeValue.trim() === '') {
    console.error('SafeSelectItem: Critical error - cannot create safe value, not rendering');
    return null;
  }

  console.log('SafeSelectItem: Using safe value:', { 
    original: value, 
    safe: safeValue,
    type: typeof safeValue,
    length: safeValue.length
  });

  return (
    <SelectItem 
      value={safeValue} 
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </SelectItem>
  );
};

export default SafeSelectItem;
