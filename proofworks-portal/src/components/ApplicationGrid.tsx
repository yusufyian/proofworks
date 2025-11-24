import { motion } from 'framer-motion';
import { applications } from '../data/applications';
import { ApplicationCard } from './ApplicationCard';
import { Target, Zap, Shield } from 'lucide-react';

export function ApplicationGrid() {
  return (
    <section id="applications" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-gray-50">
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
            <span className="text-gray-900">十大规模化应用解决方案</span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            脱虚向实，技术与产业深度融合
            <br />
            <span className="text-xl text-gray-500">覆盖政务、医疗、教育、工业制造等领域，解决商业与社会治理中的信任协作难题</span>
          </p>
        </motion.div>

        {/* Application cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20" style={{ gridAutoRows: '1fr', gridAutoColumns: '1fr' }}>
          {applications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full w-full flex"
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
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            为什么选择 申达链？
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: '服务实体经济',
                description: '聚焦技术与实体经济结合部，解决行业痛点，拥有实际落地案例',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Zap,
                title: '产业深度融合',
                description: '与政府及大型国企深度合作，在政务、医疗、教育、工业制造等领域实现产业融合',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Shield,
                title: '主权区块链',
                description: '国家主权和法律框架下运行，拥抱技术、排除投机，确保安全可控合规',
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
                <h4 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
