import { motion } from 'framer-motion';
import { Star, Users, TrendingUp, Award } from 'lucide-react';

export function Stats() {
  const stats = [
    {
      icon: Users,
      value: '500+',
      label: '企业客户',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      value: '90%',
      label: '效率提升',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      value: '100%',
      label: '合规率',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Star,
      value: '4.9/5',
      label: '客户满意度',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-900">数据说话</span>
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            用事实证明技术与实体经济深度融合的价值
          </p>
          <p className="text-base text-gray-500">
            数据即资产 · 为数据要素市场化创造安全可信条件
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass p-6 rounded-xl text-center hover:scale-105 transition-transform duration-300"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2 text-gray-900">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
