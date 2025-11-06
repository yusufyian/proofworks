import { motion } from 'framer-motion';
import { applications } from '../data/applications';
import { Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

export function ApplicationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const industries = useMemo(() => {
    const allIndustries = new Set<string>();
    applications.forEach(app => {
      app.industries.forEach(industry => {
        allIndustries.add(industry);
      });
    });
    return Array.from(allIndustries);
  }, []);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.tagline.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIndustry = 
        selectedIndustry === 'all' || 
        app.industries.some(ind => ind === selectedIndustry);
      
      return matchesSearch && matchesIndustry;
    });
  }, [searchTerm, selectedIndustry]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          <span className="text-white">搜索解决方案</span>
        </h2>
        
        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索应用名称、功能或行业..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Industry filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="text-gray-400 w-5 h-5" />
          <button
            onClick={() => setSelectedIndustry('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedIndustry === 'all'
                ? 'bg-blue-600 text-white'
                : 'glass text-gray-300 hover:bg-white/10'
            }`}
          >
            全部
          </button>
          {industries.slice(0, 8).map((industry) => (
            <button
              key={industry}
              onClick={() => setSelectedIndustry(industry)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedIndustry === industry
                  ? 'bg-blue-600 text-white'
                  : 'glass text-gray-300 hover:bg-white/10'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app) => (
            <Link key={app.id} to={`/app/${app.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass rounded-2xl p-6 h-full flex flex-col cursor-pointer group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{app.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{app.shortName}</h3>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">{app.tagline}</p>
                  <div className="flex flex-wrap gap-2">
                    {app.industries.slice(0, 2).map((industry, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-full bg-white/10"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">未找到匹配的解决方案</p>
            <p className="text-gray-500 text-sm mt-2">试试其他关键词或筛选条件</p>
          </div>
        )}
      </div>

      {/* Result count */}
      {filteredApplications.length > 0 && (
        <div className="mt-8 text-center text-gray-400">
          找到 {filteredApplications.length} 个解决方案
        </div>
      )}
    </div>
  );
}

