import { motion } from 'framer-motion';
import { CheckCircle2, BarChart3, Users } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: BarChart3,
      title: '数据驱动决策',
      description: '实时数据分析和可视化报表，助力企业精准决策',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: '多方协作',
      description: '支持供应链上下游、金融机构、监管机构等多方参与',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: CheckCircle2,
      title: '合规保障',
      description: '严格遵守国内法律法规，通过审计和监管检查',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">核心优势</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            基于区块链技术的可信数据基础设施
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass p-8 rounded-2xl hover:scale-105 transition-transform duration-300"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
