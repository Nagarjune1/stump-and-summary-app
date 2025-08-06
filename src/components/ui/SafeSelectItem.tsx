
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
  // Create absolutely safe value with multiple fallback layers
  const createSafeValue = (inputValue: any): string => {
    // Handle null/undefined immediately
    if (inputValue === null || inputValue === undefined) {
      return `safe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Convert to string safely
    let stringValue: string;
    try {
      stringValue = String(inputValue);
    } catch (error) {
      return `safe_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Trim whitespace
    stringValue = stringValue.trim();
    
    // Check for empty or invalid strings
    if (stringValue === '' || 
        stringValue === 'null' || 
        stringValue === 'undefined' || 
        stringValue.length === 0) {
      return `safe_empty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return stringValue;
  };

  const safeValue = createSafeValue(value);
  
  // Double check - if somehow still empty, don't render
  if (!safeValue || safeValue.trim() === '') {
    console.error('SafeSelectItem: Critical validation failed, not rendering');
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
