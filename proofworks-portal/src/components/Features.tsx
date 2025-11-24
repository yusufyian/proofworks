import { motion } from 'framer-motion';
import { CheckCircle2, BarChart3, Users, Database } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Database,
      title: '可信数据空间',
      description: '原始数据不出域、数据可用不可见，为数据要素市场化创造安全条件',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: BarChart3,
      title: '自主可控技术',
      description: '自主可控的高可信区块链网络，高性能、高安全、高互通',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: '产业深度融合',
      description: '脱虚向实，技术与产业深度融合，解决政务、医疗、教育、工业制造等领域的信任协作难题',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: CheckCircle2,
      title: '主权区块链',
      description: '国家主权和法律框架下运行，拥抱技术、排除投机，确保安全可控合规',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gray-900">核心优势</span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto mb-4">
            国家数字基础设施核心，为数据要素市场化奠定基石
          </p>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            服务实体经济和国家数字化战略，让数据成为可确权、可流通、可增值的数字资产
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
