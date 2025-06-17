import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';

interface LogoProps {
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ size = 24 }) => {
  return (
    <div className="relative">
      <Calendar 
        size={size} 
        className="text-purple-600 dark:text-purple-400" 
      />
      <CheckCircle 
        size={size * 0.5} 
        className="text-teal-600 dark:text-teal-400 absolute -bottom-1 -right-1" 
      />
    </div>
  );
};

export default Logo;