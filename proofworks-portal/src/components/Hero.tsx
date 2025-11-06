import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Simplified background - more minimal */}
      <div className="absolute inset-0">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-transparent to-purple-950/30"></div>
        
        {/* Large subtle orbs - more atmospheric */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]"></div>
        
        {/* Minimal grid pattern - more subtle */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:80px_80px]"></div>
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
            <span className="text-gradient block mb-4">ProofWorks</span>
            <span className="text-white block text-5xl md:text-6xl lg:text-7xl font-light">
              企业级区块链解决方案
            </span>
          </motion.h1>

          {/* Subheading - more spacious */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-2xl md:text-3xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed font-light"
          >
            十大规模化应用解决方案
            <br />
            <span className="text-xl md:text-2xl text-gray-400 mt-4 block">
              降本增效 · 合规保障 · 数字化转型
            </span>
          </motion.p>

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
              className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-semibold text-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 min-w-[240px]"
            >
              探索解决方案
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl font-semibold text-xl hover:bg-white/10 transition-all duration-300 min-w-[240px]"
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
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{item.value}</div>
                <div className="text-lg text-gray-400">{item.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
