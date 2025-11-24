import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Simplified background - more minimal */}
      <div className="absolute inset-0">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-slate-50/50"></div>
        
        {/* Large subtle orbs - more atmospheric */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-slate-100/30 rounded-full blur-[120px]"></div>
      </div>

      {/* Content - more spacious and grand */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center"
        >
          {/* Main heading - larger and bolder */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-tight"
          >
            <span className="text-blue-600 block mb-4">申达链</span>
            <span className="text-gray-900 block text-5xl md:text-6xl lg:text-7xl font-light">
              服务实体经济的可信区块链基础设施
            </span>
          </motion.h1>

          {/* Subheading - more spacious */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-2xl md:text-3xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed font-light"
          >
            自主可控的高可信区块链网络
            <br />
            <span className="text-xl md:text-2xl text-gray-500 mt-4 block">
              脱虚向实 · 产业融合 · 数据要素市场化
            </span>
          </motion.p>

          {/* Data as Asset concept */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-16 max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <p className="text-lg md:text-xl font-semibold text-gray-800">
                <span className="text-blue-600">数据即资产</span>
                <span className="text-gray-600 mx-2">·</span>
                <span className="text-gray-700">原始数据不出域、数据可用不可见，奠定数据要素市场化基石</span>
              </p>
            </div>
          </motion.div>

          {/* CTA buttons - larger and more prominent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.a
              href="#applications"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group px-10 py-5 bg-blue-600 text-white rounded-xl font-semibold text-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 min-w-[240px]"
            >
              探索解决方案
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-300 min-w-[240px]"
            >
              联系我们
            </motion.a>
          </motion.div>

          {/* Key metrics - simplified and more elegant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-24 grid grid-cols-3 gap-12 max-w-4xl mx-auto"
          >
            {[
              { value: '90%', label: '效率提升' },
              { value: '100%', label: '合规率' },
              { value: '500+', label: '企业客户' }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{item.value}</div>
                <div className="text-lg text-gray-600">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
