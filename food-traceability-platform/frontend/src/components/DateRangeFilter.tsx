import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const earliestDate = '2024-06-01'; // 数据文件中的最早日期

  const quickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  const selectAll = () => {
    onStartDateChange(earliestDate);
    onEndDateChange(today);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-gray-500" />
        <label className="text-sm font-medium text-gray-700">时间范围：</label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={startDate}
          min={earliestDate}
          max={endDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="input text-sm w-auto"
        />
        <span className="text-gray-500">至</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          max={today}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="input text-sm w-auto"
        />
      </div>
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        <span className="text-xs text-gray-500">快捷选择：</span>
        <button
          onClick={() => quickSelect(7)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          最近7天
        </button>
        <button
          onClick={() => quickSelect(30)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          最近30天
        </button>
        <button
          onClick={() => quickSelect(90)}
          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          最近90天
        </button>
        <button
          onClick={selectAll}
          className="px-3 py-1 text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors font-medium"
        >
          全部数据
        </button>
      </div>
    </div>
  );
};

