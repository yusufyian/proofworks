import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  mode?: 'hover' | 'click';
  className?: string;
}

export default function HelpTooltip({
  content,
  title,
  position = 'top',
  mode = 'click',
  className = '',
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mode === 'click' && isVisible) {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          tooltipRef.current &&
          !tooltipRef.current.contains(e.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node)
        ) {
          setIsVisible(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mode, isVisible]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => mode === 'click' && setIsVisible(!isVisible)}
        onMouseEnter={() => mode === 'hover' && setIsVisible(true)}
        onMouseLeave={() => mode === 'hover' && setIsVisible(false)}
        className={`text-gray-400 hover:text-primary-600 transition-colors focus:outline-none ${className}`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200"
          onClick={() => setIsVisible(false)}
        >
          <div
            ref={tooltipRef}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden border border-gray-100 transform transition-all duration-200 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-3xl border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{title || '帮助说明'}</h2>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-88px)] p-6 text-gray-700 leading-relaxed">
              {typeof content === 'string' ? (
                <div className="whitespace-pre-line">{content}</div>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

