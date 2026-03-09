import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';

const COLORS = {
  primary: '#1d4ed8',
  saffron: '#f97316',
  green: '#16a34a',
  red: '#dc2626',
  purple: '#7c3aed',
  amber: '#d97706',
  gray: '#6b7280',
};

const FRAUD_LEVEL_COLORS = {
  high: '#dc2626',
  medium: '#f97316',
  low: '#16a34a',
};

const STATUS_COLORS = {
  pending: '#6b7280',
  approved: '#16a34a',
  rejected: '#dc2626',
  under_review: '#d97706',
};

// Shared tooltip style
const tooltipStyle = {
  backgroundColor: '#1f2937',
  border: 'none',
  borderRadius: '8px',
  color: '#f9fafb',
  fontSize: '12px',
};

/**
 * Applications per scheme — horizontal bar chart
 */
export function SchemeBarChart({ data }) {
  if (!data?.length) return <EmptyChart />;

  const truncated = data.map((d) => ({
    ...d,
    name: d.name.length > 20 ? d.name.substring(0, 18) + '…' : d.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={truncated}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 11 }}
          tickLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="applications" fill={COLORS.primary} radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Daily application trend — area chart
 */
export function DailyTrendChart({ data }) {
  if (!data?.length) return <EmptyChart />;

  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.2} />
            <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Area
          type="monotone"
          dataKey="applications"
          name="Total Applications"
          stroke={COLORS.primary}
          fill="url(#colorApps)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Area
          type="monotone"
          dataKey="fraudulent"
          name="Flagged"
          stroke={COLORS.red}
          fill="url(#colorFraud)"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Fraud risk distribution — donut pie chart
 */
export function FraudPieChart({ data }) {
  if (!data?.length) return <EmptyChart />;

  const pieData = data.map((d) => ({
    name: d.level?.charAt(0).toUpperCase() + d.level?.slice(1) || 'Unknown',
    value: d.count,
    color: FRAUD_LEVEL_COLORS[d.level] || COLORS.gray,
  }));

  const renderLabel = ({ name, value, percent }) =>
    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          label={renderLabel}
          labelLine={false}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Application status distribution — bar chart
 */
export function StatusBarChart({ data }) {
  if (!data?.length) return <EmptyChart />;

  const formatted = data.map((d) => ({
    status: d.name?.charAt(0).toUpperCase() + d.name?.slice(1).replace('_', ' '),
    count: d.value,
    fill: STATUS_COLORS[d.name] || COLORS.gray,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="status" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" maxBarSize={40} radius={[4, 4, 0, 0]}>
          {formatted.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Empty state for charts with no data
 */
function EmptyChart() {
  return (
    <div className="h-48 flex flex-col items-center justify-center text-gray-400">
      <div className="text-3xl mb-2">📊</div>
      <p className="text-sm">No data available yet</p>
      <p className="text-xs mt-1">Data will appear after applications are submitted</p>
    </div>
  );
}
