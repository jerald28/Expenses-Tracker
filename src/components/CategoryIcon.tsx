import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function CategoryIcon({ name, className = '', size = 20 }: CategoryIconProps) {
  // Safe dynamic lookup helper
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[name];
  
  if (!IconComponent) {
    return <Icons.HelpCircle className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
}
