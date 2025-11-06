import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Target, TrendingUp, Play, ExternalLink } from 'lucide-react';
import { applications } from '../data/applications';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { AnimatedGridBackground } from '../components/AnimatedGridBackground';

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const app = applications.find(a => a.id === id);

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">应用未找到</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedGridBackground />
      <div className="relative z-10">
        <Navbar />
      {/* Header */}
      <div className={`relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br ${app.gradient} mt-16`}>
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回首页</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-6xl mb-6">{app.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{app.name}</h1>
            <p className="text-xl text-white/95 mb-6">{app.tagline}</p>
            <p className="text-lg text-white/90 max-w-3xl mb-8">{app.description}</p>
            
            {/* Demo button */}
            {app.demoUrl && (
              <motion.a
                href={app.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                立即体验 Demo
                <ExternalLink className="w-5 h-5" />
              </motion.a>
            )}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Pain Points */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-red-600" />
              <h2 className="text-3xl font-bold text-gray-900">核心痛点</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {app.painPoints.map((point, i) => (
                <div key={i} className="glass p-4 rounded-lg flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Core Value */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900">核心价值</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {app.coreValue.map((value, i) => (
                <div key={i} className="glass p-4 rounded-lg flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-700 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Key Metrics */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">关键指标</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {app.keyMetrics.map((metric, i) => (
                <div
                  key={i}
                  className="glass p-6 rounded-xl text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="text-3xl font-bold mb-2 text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.label}</div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Industries */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900">适用行业</h2>
            <div className="flex flex-wrap gap-3">
              {app.industries.map((industry, i) => (
                <div
                  key={i}
                  className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors"
                >
                  {industry}
                </div>
              ))}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">准备开始了吗？</h3>
              <p className="text-gray-600 mb-8">联系我们获取专属解决方案和定制化服务</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {app.demoUrl && (
                  <motion.a
                    href={app.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-lg font-semibold text-lg shadow-lg hover:border-blue-600 hover:shadow-xl transition-all duration-300"
                  >
                    <Play className="w-5 h-5" />
                    体验 Demo
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                )}
                <motion.a
                  href="mailto:contact@proofworks.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
                >
                  立即咨询
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}

