import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-strong shadow-lg' : 'glass'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">链证云</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#applications" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              解决方案
            </a>
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              核心优势
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              联系我们
            </a>
            <a
              href="mailto:contact@proofworks.com"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              立即咨询
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-4 border-t border-gray-200"
          >
            <a
              href="#applications"
              className="block text-gray-600 hover:text-gray-900 transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              解决方案
            </a>
            <a
              href="#features"
              className="block text-gray-600 hover:text-gray-900 transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              核心优势
            </a>
            <a
              href="#contact"
              className="block text-gray-600 hover:text-gray-900 transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              联系我们
            </a>
            <a
              href="mailto:contact@proofworks.com"
              className="block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
            >
              立即咨询
            </a>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
