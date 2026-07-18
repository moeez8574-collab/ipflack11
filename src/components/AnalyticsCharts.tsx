import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";

// Premium Theme Colors
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

interface RevenueChartProps {
  data: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="w-full h-80 min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={11}
            tickLine={false}
          />
          <YAxis 
            yAxisId="left"
            stroke="#64748b" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#64748b" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#111827", 
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
              fontFamily: "sans-serif"
            }} 
          />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="clicks" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorClicks)" 
            name="Traffic Clicks"
          />
          <Area 
            yAxisId="right"
            type="monotone" 
            dataKey="earnings" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorEarnings)" 
            name="Earnings ($)"
          />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="orders" 
            stroke="#f59e0b" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorOrders)" 
            name="Total Orders"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DistributionProps {
  data: any[];
}

export function GeographicDistribution({ data }: DistributionProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={80} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "11px"
            }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Clicks">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DeviceBreakdown({ data }: DistributionProps) {
  return (
    <div className="w-full h-64 flex flex-col justify-center items-center">
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "11px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            <span className="text-[10px] text-gray-400 capitalize">{entry.name} ({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReferrerBreakdown({ data }: DistributionProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              borderColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "11px"
            }}
          />
          <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Visitor Clicks">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
