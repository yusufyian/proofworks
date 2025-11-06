import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  application: string;
}

const testimonials: Testimonial[] = [
  {
    name: '张总',
    role: '供应链总监',
    company: '某大型制造企业',
    content: '供应链金融平台上线后，我们的融资效率提升了90%，中小企业供应商的融资成功率大幅提高，资金周转明显加快。',
    rating: 5,
    application: '供应链金融'
  },
  {
    name: '李经理',
    role: '质量总监',
    company: '某食品企业',
    content: '食品追溯系统帮助我们实现了从原料到成品的全程追溯，在食品安全事件中能够快速定位问题批次，召回响应速度提升了95%。',
    rating: 5,
    application: '食品追溯'
  },
  {
    name: '王总',
    role: '财务总监',
    company: '某零售连锁企业',
    content: '结算对账自动化系统将我们的对账时间从3天缩短到30分钟，人工成本下降了80%，准确率达到了99.99%。',
    rating: 5,
    application: '结算对账'
  }
];

export function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">客户评价</span>
          </h2>
          <p className="text-xl text-gray-300">
            听听客户怎么说
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass p-6 rounded-xl hover:scale-105 transition-transform duration-300"
            >
              <Quote className="w-8 h-8 text-blue-400 mb-4" />
              <p className="text-gray-300 mb-6 line-clamp-4">{testimonial.content}</p>
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-400">{testimonial.role}</div>
                <div className="text-sm text-gray-500">{testimonial.company}</div>
                <div className="mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                    {testimonial.application}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

