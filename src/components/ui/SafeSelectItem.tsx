
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
  // Double-check to ensure value is never empty string
  const safeValue = ensureValidSelectItemValue(value);
  
  // Additional safety check - if somehow we still get an empty string, don't render
  if (!safeValue || safeValue === '' || safeValue === 'null' || safeValue === 'undefined') {
    console.error('SafeSelectItem: Attempted to render with invalid value:', { 
      original: value, 
      processed: safeValue 
    });
    return null;
  }
  
  console.log('SafeSelectItem: Rendering with safe value:', { 
    original: value, 
    safe: safeValue,
    isEmpty: value === '' || value === null || value === undefined 
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
