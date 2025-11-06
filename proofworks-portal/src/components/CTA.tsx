import { motion } from 'framer-motion';
import { Mail, Phone, MessageSquare } from 'lucide-react';

export function CTA() {
  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">开启数字化转型之旅</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            联系我们，获取专属解决方案和定制化服务
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Mail, label: '邮件咨询', value: 'contact@proofworks.com' },
              { icon: Phone, label: '电话咨询', value: '400-XXX-XXXX' },
              { icon: MessageSquare, label: '在线咨询', value: '立即咨询' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass p-6 rounded-xl"
              >
                <item.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                <p className="font-semibold">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <motion.a
            href="mailto:contact@proofworks.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            立即联系我们
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

