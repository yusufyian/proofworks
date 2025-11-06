import { motion } from 'framer-motion';
import { applications } from '../data/applications';
import { ApplicationCard } from './ApplicationCard';
import { Target, Zap, Shield } from 'lucide-react';

export function ApplicationGrid() {
  return (
    <section id="applications" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">十大规模化应用解决方案</span>
          </h2>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            覆盖供应链金融、食品安全、合规监管、数据要素等核心场景
            <br />
            <span className="text-xl text-gray-400">助力企业数字化转型，实现降本增效与合规保障</span>
          </p>
        </motion.div>

        {/* Application cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {applications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ApplicationCard application={app} />
            </motion.div>
          ))}
        </div>

        {/* Why choose us */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            <span className="text-white">为什么选择 链证云？</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: '直击痛点',
                description: '深入理解行业需求，直击企业核心痛点，提供针对性的解决方案',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Zap,
                title: '快速见效',
                description: '投资回收期短，快速实现业务价值，ROI显著提升',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Shield,
                title: '合规保障',
                description: '严格遵守国内监管要求，100%合规，避免法律风险',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass p-8 rounded-2xl hover:scale-105 transition-transform duration-300"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

