import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-blue-600 mb-4">申达链</h3>
            <p className="text-gray-600 text-sm">
              服务实体经济和国家数字化战略的区块链基础设施
              <br />
              构建自主可控的高可信区块链网络，为数据要素市场化奠定基石
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">解决方案</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/app/supply-chain-finance" className="hover:text-blue-600 transition-colors">供应链金融</Link></li>
              <li><Link to="/app/food-traceability" className="hover:text-blue-600 transition-colors">食品追溯</Link></li>
              <li><Link to="/app/cold-chain-medical" className="hover:text-blue-600 transition-colors">冷链医药</Link></li>
              <li><Link to="/app/data-privacy-compliance" className="hover:text-blue-600 transition-colors">数据合规</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">公司信息</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#features" className="hover:text-blue-600 transition-colors">核心优势</a></li>
              <li><a href="#applications" className="hover:text-blue-600 transition-colors">全部方案</a></li>
              <li><a href="#contact" className="hover:text-blue-600 transition-colors">联系我们</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">联系方式</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:xenda@ftmoon.com" className="hover:text-blue-600 transition-colors">
                  xenda@ftmoon.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>上海陆家嘴</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>© 2025 申达链. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
