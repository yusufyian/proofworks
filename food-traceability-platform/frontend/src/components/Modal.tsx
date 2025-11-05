import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  headerColor?: 'primary' | 'success' | 'warning' | 'danger';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

const headerColorClasses = {
  primary: 'from-primary-600 to-primary-700',
  success: 'from-green-600 to-green-700',
  warning: 'from-yellow-600 to-yellow-700',
  danger: 'from-red-600 to-red-700',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  icon,
  headerColor = 'primary',
  maxWidth = '2xl',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative z-50 bg-white rounded-3xl shadow-2xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-hidden border border-gray-100 transform transition-all duration-200 scale-100`}
      >
        <div
          className={`bg-gradient-to-r ${headerColorClasses[headerColor]} text-white p-6 rounded-t-3xl border-b border-white/10`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon && <div className="flex-shrink-0">{icon}</div>}
              <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="关闭"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-88px)]">{children}</div>
      </div>
    </div>
  );
}





