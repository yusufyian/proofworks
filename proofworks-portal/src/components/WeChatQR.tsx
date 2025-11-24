import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Smartphone } from 'lucide-react';
import ServiceQR1 from '../static/qr/Service_QR_1.png';
import ServiceQR2 from '../static/qr/Service_QR_2.png';
import DevCommunityQR from '../static/qr/dev_community_QR.png';

interface WeChatQRProps {
  qrImage: string;
  title: string;
  description: string;
  guideText?: string;
}

export function WeChatQRCard({ qrImage, title, description, guideText }: WeChatQRProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass p-6 rounded-xl text-center hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="w-32 h-32 bg-white rounded-lg p-2 shadow-md">
            <img 
              src={qrImage} 
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{description}</p>
      
      {guideText && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200">
          <Smartphone className="w-4 h-4" />
          <span>{guideText}</span>
        </div>
      )}
    </motion.div>
  );
}

interface WeChatQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeChatQRModal({ isOpen, onClose }: WeChatQRModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-4xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="关闭"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">添加微信咨询</h3>
              <p className="text-gray-600">扫码添加微信，获取专属产品咨询和最新案例资料</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <WeChatQRCard
                qrImage={ServiceQR1}
                title="产品咨询"
                description="扫码添加微信，获取专属产品咨询"
                guideText="打开微信扫一扫，即刻开启对话"
              />
              <WeChatQRCard
                qrImage={ServiceQR2}
                title="产品咨询"
                description="扫码添加微信，获取专属产品咨询"
                guideText="打开微信扫一扫，即刻开启对话"
              />
              <WeChatQRCard
                qrImage={DevCommunityQR}
                title="加入交流群"
                description="扫码加入我们的产品交流群，获取最新案例资料"
                guideText="打开微信扫一扫，加入社群"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

