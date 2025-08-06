
import React from 'react';
import { SelectItem } from '@/components/ui/select';
import { ensureValidSelectItemValue } from '@/utils/selectUtils';

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
  // Multiple layers of validation to absolutely prevent empty strings
  let safeValue: string;
  
  try {
    // First layer - use our utility function
    safeValue = ensureValidSelectItemValue(value);
    
    // Second layer - additional validation with multiple checks
    if (!safeValue || 
        safeValue === '' || 
        safeValue === 'null' || 
        safeValue === 'undefined' ||
        safeValue.trim() === '' ||
        safeValue.length === 0 ||
        typeof safeValue !== 'string') {
      
      console.error('SafeSelectItem: First validation failed, creating emergency fallback:', { 
        original: value, 
        processed: safeValue 
      });
      
      // Emergency fallback with timestamp and random string
      safeValue = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    }
    
    // Third layer - final safety check with string coercion
    safeValue = String(safeValue).trim();
    
    if (safeValue.length === 0) {
      console.error('SafeSelectItem: Final validation failed, using ultimate fallback');
      safeValue = `ultimate_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
    }
    
  } catch (error) {
    console.error('SafeSelectItem: Error during validation, using crash fallback:', error);
    safeValue = `crash_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 25)}`;
  }
  
  // Fourth layer - absolutely final check before rendering
  if (!safeValue || safeValue === '' || safeValue.trim() === '') {
    console.error('SafeSelectItem: All validation layers failed, not rendering item');
    return null;
  }
  
  console.log('SafeSelectItem: Successfully validated value:', { 
    original: value, 
    final: safeValue,
    type: typeof safeValue,
    length: safeValue.length,
    trimmed: safeValue.trim().length
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
