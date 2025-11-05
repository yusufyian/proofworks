import React from 'react';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | React.ReactNode;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 glass rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-in">
        <div className="sticky top-0 glass-dark rounded-t-2xl px-6 py-4 flex items-center justify-between border-b border-white/10">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 text-gray-700 leading-relaxed">
          {typeof content === 'string' ? (
            <div className="whitespace-pre-line">{content}</div>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
};

