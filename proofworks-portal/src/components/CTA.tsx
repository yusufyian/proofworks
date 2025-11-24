import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { WeChatQRCard } from './WeChatQR';
import ServiceQR1 from '../static/qr/Service_QR_1.png';
import ServiceQR2 from '../static/qr/Service_QR_2.png';
import DevCommunityQR from '../static/qr/dev_community_QR.png';

export function CTA() {
  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">开启数字化转型之旅</span>
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            联系我们，获取服务实体经济的区块链解决方案
          </p>
          <p className="text-lg text-gray-500 mb-12">
            构建可信数据空间，为数据要素市场化奠定基石，让数据成为可确权、可流通、可增值的数字资产
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* 邮件咨询 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass p-6 rounded-xl"
            >
              <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">邮件咨询</p>
              <p className="font-semibold text-gray-900">xenda@ftmoon.com</p>
            </motion.div>

            {/* 微信咨询 - 产品咨询 1 */}
            <WeChatQRCard
              qrImage={ServiceQR1}
              title="产品咨询"
              description="扫码添加微信，获取专属产品咨询"
              guideText="打开微信扫一扫，即刻开启对话"
            />

            {/* 微信咨询 - 产品咨询 2 */}
            <WeChatQRCard
              qrImage={ServiceQR2}
              title="产品咨询"
              description="扫码添加微信，获取专属产品咨询"
              guideText="打开微信扫一扫，即刻开启对话"
            />

            {/* 微信咨询 - 加入交流群 */}
            <WeChatQRCard
              qrImage={DevCommunityQR}
              title="加入交流群"
              description="扫码加入我们的产品交流群，获取最新案例资料"
              guideText="打开微信扫一扫，加入社群"
            />
          </div>

          <motion.a
            href="mailto:xenda@ftmoon.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
          >
            发送邮件咨询
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
