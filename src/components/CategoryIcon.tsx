import React from 'react';
import { Utensils, ShoppingBag, Car, Film, Home, Heart, Plane, BookOpen, HelpCircle } from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

// Only the icons used by categories are bundled (importing all of lucide added ~1.5 MB)
const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Utensils, ShoppingBag, Car, Film, Home, Heart, Plane, BookOpen, HelpCircle,
};

export default function CategoryIcon({ name, className = '', size = 20 }: CategoryIconProps) {
  const IconComponent = ICONS[name] ?? HelpCircle;
  return <IconComponent className={className} size={size} />;
}
