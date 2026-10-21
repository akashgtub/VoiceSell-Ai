import React from 'react';
import { StatusDistribution, ActivityDataPoint } from '../../types';
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

export const StatusChart: React.FC<StatusChartProps> = ({ distribution, activity, totalCalls }) => {
  const filteredDistribution = distribution.filter(d => d.count > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Activity Over Time Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Call Activity & Pipeline Velocity</h3>
              <p className="text-xs text-slate-500">Daily breakdown of total calls vs demo requests</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-500"></span>
                <span className="text-slate-600">Total Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent-500"></span>
                <span className="text-slate-600">Demos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          {totalCalls === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <p className="text-sm font-medium">No sales calls recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Start a call from the Live Call tab to populate activity trends.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="calls" name="Calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demos" name="Demos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sales Status Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Sales Outcome Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Classified by AI qualification engine</p>
        </div>

        <div className="h-48 w-full flex items-center justify-center">
          {filteredDistribution.length === 0 ? (
            <div className="text-center text-slate-400">
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-200 mx-auto mb-2"></div>
              <p className="text-xs font-medium">Awaiting first completed call</p>
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
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs">
          {distribution.slice(0, 4).map((d) => (
            <div key={d.status} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="text-slate-600 truncate">{d.status}</span>
              </div>
              <span className="font-bold text-slate-800">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
