
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
  // CRITICAL: Pre-validation check - catch any problematic values immediately
  const performPreValidation = (inputValue: any): string | null => {
    // Immediate null/undefined check
    if (inputValue === null || inputValue === undefined) {
      console.warn('SafeSelectItem: Pre-validation caught null/undefined value');
      return null;
    }
    
    // Convert to string and check immediately
    let stringValue: string;
    try {
      stringValue = String(inputValue);
    } catch (error) {
      console.error('SafeSelectItem: Pre-validation string conversion failed:', error);
      return null;
    }
    
    // Immediate empty string check
    if (stringValue === '' || stringValue.trim() === '') {
      console.warn('SafeSelectItem: Pre-validation caught empty string:', { original: inputValue, converted: stringValue });
      return null;
    }
    
    return stringValue;
  };

  // CRITICAL: Perform pre-validation first
  const preValidated = performPreValidation(value);
  
  // If pre-validation fails, don't render at all
  if (preValidated === null) {
    console.error('SafeSelectItem: Pre-validation failed, component will not render');
    return null;
  }

  // Create absolutely safe value with multiple fallback mechanisms
  const createSafeValue = (inputValue: any): string => {
    // Handle null/undefined immediately
    if (inputValue === null || inputValue === undefined) {
      const fallback = `safe_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
      console.warn('SafeSelectItem: null/undefined detected, using fallback:', fallback);
      return fallback;
    }

    let stringValue: string;
    
    // Convert to string safely
    try {
      stringValue = String(inputValue);
    } catch (error) {
      console.error('SafeSelectItem: Failed to convert value to string:', error);
      const fallback = `error_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
      return fallback;
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
      const fallback = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
      return fallback;
    }

    // Final safety check
    if (!stringValue || stringValue.trim().length === 0) {
      console.error('SafeSelectItem: Final validation failed, using emergency fallback');
      const fallback = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 25)}`;
      return fallback;
    }

    return stringValue;
  };

  const safeValue = createSafeValue(value);

  // CRITICAL: Final validation before render - absolutely ensure no empty strings
  if (!safeValue || 
      safeValue === '' || 
      safeValue.trim() === '' ||
      safeValue.length === 0 ||
      typeof safeValue !== 'string') {
    console.error('SafeSelectItem: CRITICAL ERROR - Final validation failed, cannot render with value:', safeValue);
    return null;
  }

  // CRITICAL: Double-check the value one more time before passing to SelectItem
  const finalValue = safeValue.trim();
  if (finalValue === '') {
    console.error('SafeSelectItem: CRITICAL ERROR - Final value is empty after trim, aborting render');
    return null;
  }

  console.log('SafeSelectItem: Rendering with validated value:', { 
    original: value, 
    safe: finalValue,
    type: typeof finalValue,
    length: finalValue.length,
    isEmpty: finalValue === '',
    isTrimmedEmpty: finalValue.trim() === ''
  });

  return (
    <SelectItem 
      value={finalValue} 
      className={className}
      disabled={disabled}
      {...props}
    >
      {children}
    </SelectItem>
  );
};

export default SafeSelectItem;
