export default function AdminStats({ stats }) {
  if (!stats) return null;

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users,
      change: stats.user_growth,
      icon: "#",
      color: "blue"
    },
    {
      title: "Scans Processed", 
      value: stats.total_scans,
      change: stats.scan_growth,
      icon: "⌕",
      color: "purple"
    },
    {
      title: "Countries Covered",
      value: stats.countries_covered,
      change: stats.countries_growth,
      icon: "◯",
      color: "green"
    },
    {
      title: "Avg Processing",
      value: stats.avg_processing_time,
      change: stats.processing_improvement,
      icon: "⟳",
      color: "orange"
    }
  ];

  const getIconBg = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      purple: "bg-purple-100 text-purple-600", 
      green: "bg-green-100 text-green-600",
      orange: "bg-orange-100 text-orange-600"
    };
    return colors[color] || "bg-gray-100 text-gray-600";
  };

  const getChangeColor = (change) => {
    if (change.includes('+') && !change.includes('faster')) return "text-green-600";
    if (change.includes('-') && change.includes('faster')) return "text-green-600";
    if (change.includes('-')) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl p-6 border border-accent hover:border-button transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg(card.color)}`}>
              <span className="text-xl">{card.icon}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-primary opacity-70">{card.title}</h3>
            <p className="text-2xl font-bold text-primary">{card.value}</p>
            <p className={`text-sm font-medium ${getChangeColor(card.change)}`}>
              {card.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
