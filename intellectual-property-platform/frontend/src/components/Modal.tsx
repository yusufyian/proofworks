import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  headerColor?: 'primary' | 'green' | 'blue' | 'purple' | 'orange' | 'indigo';
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const headerColorMap = {
  primary: 'from-indigo-600 to-purple-600',
  green: 'from-green-600 to-green-700',
  blue: 'from-blue-600 to-blue-700',
  purple: 'from-purple-600 to-purple-700',
  orange: 'from-orange-600 to-orange-700',
  indigo: 'from-indigo-600 to-purple-600',
};

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  icon,
  headerColor = 'primary',
  children,
  maxWidth = '3xl',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl ${maxWidthMap[maxWidth]} w-full max-h-[90vh] overflow-hidden border border-gray-100 transform transition-all duration-200 scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className={`sticky top-0 bg-gradient-to-r ${headerColorMap[headerColor]} text-white p-6 rounded-t-3xl border-b border-white/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
                  {icon}
                </div>
              )}
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

        {/* 内容区域 */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

