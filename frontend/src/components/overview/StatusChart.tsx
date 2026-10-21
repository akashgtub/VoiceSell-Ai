import React from 'react';
import type { StatusDistribution, ActivityDataPoint } from '../../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface StatusChartProps {
  distribution: StatusDistribution[];
  activity: ActivityDataPoint[];
  totalCalls: number;
}

const PURPLE_CHART_COLORS: Record<string, string> = {
  'Converted': '#16A34A',
  'Demo Requested': '#4C1D95',
  'Interested': '#6C3BDB',
  'Follow-up Required': '#F59E0B',
  'Not Interested': '#DC2626',
  'No Response': '#77718A',
  'In Progress': '#8054EC',
};

export const StatusChart: React.FC<StatusChartProps> = ({ distribution, activity, totalCalls }) => {
  const filteredDistribution = distribution
    .filter(d => d.count > 0)
    .map(d => ({
      ...d,
      color: PURPLE_CHART_COLORS[d.status] || '#6C3BDB'
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Activity Over Time Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#211A33]">Call Activity & Pipeline Velocity</h3>
              <p className="text-xs text-[#77718A]">Daily breakdown of calls versus demo requests</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#6C3BDB]"></span>
                <span className="text-[#211A33]">Total Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#4C1D95]"></span>
                <span className="text-[#211A33]">Demos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          {totalCalls === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#77718A]">
              <p className="text-sm font-semibold text-[#211A33]">No sales calls recorded yet</p>
              <p className="text-xs text-[#77718A] mt-1">Start a call from the Live Call tab to populate activity trends.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#77718A" fontSize={12} tickLine={false} />
                <YAxis stroke="#77718A" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    border: '1px solid #E8E2F0', 
                    boxShadow: '0 4px 12px rgba(108, 59, 219, 0.08)',
                    color: '#211A33', 
                    fontSize: '12px' 
                  }}
                />
                <Bar dataKey="calls" name="Calls" fill="#6C3BDB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demos" name="Demos" fill="#4C1D95" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sales Status Breakdown */}
      <div className="bg-white rounded-2xl border border-[#E8E2F0] p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#211A33]">Sales Outcome Distribution</h3>
          <p className="text-xs text-[#77718A] mb-4">Classified by autonomous qualification logic</p>
        </div>

        <div className="h-48 w-full flex items-center justify-center">
          {filteredDistribution.length === 0 ? (
            <div className="text-center text-[#77718A]">
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-[#E8E2F0] mx-auto mb-2"></div>
              <p className="text-xs font-semibold">Awaiting first completed call</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {filteredDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    border: '1px solid #E8E2F0', 
                    boxShadow: '0 4px 12px rgba(108, 59, 219, 0.08)',
                    color: '#211A33', 
                    fontSize: '12px' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[#E8E2F0] text-xs">
          {distribution.slice(0, 4).map((d) => (
            <div key={d.status} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: PURPLE_CHART_COLORS[d.status] || '#6C3BDB' }}
                ></span>
                <span className="text-[#211A33] font-medium truncate">{d.status}</span>
              </div>
              <span className="font-bold text-[#211A33]">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
