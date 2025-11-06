import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Application } from '../data/applications';

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <Link to={`/app/${application.id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="glass rounded-2xl p-6 h-full flex flex-col cursor-pointer group relative overflow-hidden"
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${application.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
        
        <div className="relative z-10">
          {/* Icon and title */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl">{application.icon}</div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="text-blue-400"
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </div>

          <h3 className="text-xl font-bold mb-2">{application.shortName}</h3>
          <p className="text-sm text-gray-300 mb-4 line-clamp-2">{application.tagline}</p>

          {/* Key metrics */}
          <div className="flex flex-wrap gap-2 mb-4">
            {application.keyMetrics.slice(0, 2).map((metric, i) => (
              <div
                key={i}
                className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${application.gradient} opacity-80`}
              >
                {metric.label}: {metric.value}
              </div>
            ))}
          </div>

          {/* Industries */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2">适用行业</p>
            <p className="text-sm text-gray-300 line-clamp-1">
              {application.industries.slice(0, 3).join(' · ')}
              {application.industries.length > 3 && ' ...'}
            </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

