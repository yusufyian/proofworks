import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { Application } from '../data/applications';

const colorMap: Record<string, string> = {
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-green-600 hover:bg-green-700',
  cyan: 'bg-cyan-600 hover:bg-cyan-700',
  yellow: 'bg-yellow-600 hover:bg-yellow-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  red: 'bg-red-600 hover:bg-red-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
  violet: 'bg-violet-600 hover:bg-violet-700',
};

export function ApplicationCard({ application }: ApplicationCardProps) {
  const buttonColorClass = colorMap[application.color] || 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className="group relative">
      <motion.div
        whileHover={{ y: -4 }}
        className="glass rounded-2xl p-8 h-full min-h-[360px] flex flex-col relative overflow-visible border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
      >
        {/* Subtle gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${application.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
        
        <Link to={`/app/${application.id}`} className="flex-1 flex flex-col">
          <div className="relative z-10 flex-1 flex flex-col">
            {/* Icon and title */}
            <div className="flex items-start justify-between mb-6">
              <div className="text-5xl">{application.icon}</div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-2xl font-bold mb-3 text-gray-900">{application.shortName}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed line-clamp-2">{application.tagline}</p>

            {/* Key metrics */}
            <div className="flex flex-wrap gap-2 mb-6">
              {application.keyMetrics.slice(0, 2).map((metric, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${application.gradient} opacity-90 text-white`}
                >
                  {metric.label}: {metric.value}
                </div>
              ))}
            </div>

            {/* Industries */}
            <div className="mt-auto pt-6 border-t border-gray-200 mb-4">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">适用行业</p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {application.industries.slice(0, 3).join(' · ')}
                {application.industries.length > 3 && ' ...'}
              </p>
            </div>
          </div>
        </Link>

        {/* Demo button - separate from card link */}
        {application.demoUrl && (
          <motion.a
            href={application.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative z-20 mt-4 px-4 py-2.5 ${buttonColorClass} rounded-lg text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2`}
          >
            <Play className="w-4 h-4" />
            进入演示
          </motion.a>
        )}
      </motion.div>
    </div>
  );
}
