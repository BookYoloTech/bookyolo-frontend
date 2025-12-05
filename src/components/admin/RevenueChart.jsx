export default function RevenueChart({ stats }) {
  if (!stats) return null;

  const revenueData = [
    { label: "Premium Subscriptions", value: stats.total_revenue, color: "bg-button" },
    { label: "Free Users", value: stats.free_users, color: "bg-blue-500" },
    { label: "Premium Users", value: stats.premium_users, color: "bg-purple-500" }
  ];

  return (
    <div className="bg-white rounded-xl border border-accent p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary">Revenue Overview</h3>
        <div className="text-sm text-primary opacity-70">
          Conversion Rate: <span className="font-semibold">{stats.conversion_rate}%</span>
        </div>
      </div>

      <div className="space-y-4">
        {revenueData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-primary font-medium">{item.label}</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">
                {typeof item.value === 'number' ? 
                  (item.label.includes('Subscriptions') ? `$${item.value.toLocaleString()}` : item.value.toLocaleString()) 
                  : item.value
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Progress Bar Visualization */}
      <div className="mt-6">
        <div className="text-sm text-primary opacity-70 mb-2">User Distribution</div>
        <div className="flex h-3 bg-accent rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 transition-all duration-300" 
            style={{ width: `${(stats.free_users / (stats.free_users + stats.premium_users)) * 100}%` }}
          ></div>
          <div 
            className="bg-purple-500 transition-all duration-300"
            style={{ width: `${(stats.premium_users / (stats.free_users + stats.premium_users)) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-primary opacity-70 mt-1">
          <span>Free: {((stats.free_users / (stats.free_users + stats.premium_users)) * 100).toFixed(1)}%</span>
          <span>Premium: {((stats.premium_users / (stats.free_users + stats.premium_users)) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
