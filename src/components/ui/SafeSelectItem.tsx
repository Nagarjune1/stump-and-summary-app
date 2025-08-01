
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
  const safeValue = ensureValidSelectItemValue(value);
  
  console.log('SafeSelectItem: Ensuring safe value:', { 
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
