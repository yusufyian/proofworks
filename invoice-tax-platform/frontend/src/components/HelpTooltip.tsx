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
  mode = 'hover',
  className = '',
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = triggerRect.top + scrollY - tooltipRect.height - 8;
          left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + scrollY + 8;
          left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.left + scrollX - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.right + scrollX + 8;
          break;
      }

      if (left < scrollX + 10) left = scrollX + 10;
      if (left + tooltipRect.width > scrollX + window.innerWidth - 10) {
        left = scrollX + window.innerWidth - tooltipRect.width - 10;
      }
      if (top < scrollY + 10) top = scrollY + 10;

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

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

  if (mode === 'hover') {
    return (
      <div className={`relative inline-flex ${className}`}>
        <button
          ref={triggerRef}
          type="button"
          className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        {isVisible && (
          <div
            ref={tooltipRef}
            className="fixed z-50 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl pointer-events-none"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            {title && <div className="font-semibold mb-1">{title}</div>}
            <div>{content}</div>
            <div
              className={`absolute w-0 h-0 border-4 ${
                position === 'top'
                  ? 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-r-transparent border-b-transparent border-l-transparent'
                  : position === 'bottom'
                  ? 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-r-transparent border-t-transparent border-l-transparent'
                  : position === 'left'
                  ? 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-r-transparent border-t-transparent border-b-transparent'
                  : 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-l-transparent border-t-transparent border-b-transparent'
              }`}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className={`text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none ${className}`}
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
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-t-3xl border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{title || '帮助说明'}</h2>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="关闭"
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

