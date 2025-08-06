
import React from 'react';
import { SelectItem } from '@/components/ui/select';
import { ensureValidSelectItemValue } from '@/utils/selectUtils';

interface SafeSelectItemProps {
  value: any;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const SafeSelectItem: React.FC<SafeSelectItemProps> = ({ 
  value, 
  children, 
  className,
  disabled,
  ...props 
}) => {
  // Ensure value is never empty string with multiple validation layers
  const safeValue = ensureValidSelectItemValue(value);
  
  // Final safety check - if somehow we still get an empty string, don't render
  if (!safeValue || 
      safeValue === '' || 
      safeValue === 'null' || 
      safeValue === 'undefined' ||
      safeValue.trim() === '' ||
      safeValue.length === 0) {
    console.error('SafeSelectItem: Attempted to render with invalid value, skipping render:', { 
      original: value, 
      processed: safeValue 
    });
    return null;
  }
  
  console.log('SafeSelectItem: Rendering with safe value:', { 
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
