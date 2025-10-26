import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  subtitle?: string;
  badge?: {
    text: string;
    color: string;
  };
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor = 'bg-blue-100 dark:bg-blue-900/30',
  iconColor = 'text-blue-600 dark:text-blue-400',
  subtitle,
  badge,
  trend,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {badge && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
        )}
        {trend && (
          <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
};
