
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
  // Ultra-simple, bulletproof validation
  const createAbsoluteSafeValue = (inputValue: any): string => {
    // Step 1: Handle null/undefined immediately
    if (inputValue === null || inputValue === undefined) {
      return `safe_null_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Step 2: Convert to string with error handling
    let stringValue: string;
    try {
      stringValue = String(inputValue);
    } catch (error) {
      return `safe_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Step 3: Trim and validate
    const trimmed = stringValue.trim();
    
    // Step 4: If empty after trim, create safe fallback
    if (trimmed === '' || trimmed.length === 0) {
      return `safe_empty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Step 5: Return the safe value
    return trimmed;
  };

  const safeValue = createAbsoluteSafeValue(value);
  
  // Additional safety check - if somehow it's still empty, don't render
  if (!safeValue || safeValue === '' || safeValue.trim() === '') {
    console.error('SafeSelectItem: Critical safety check failed, not rendering');
    return null;
  }

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
