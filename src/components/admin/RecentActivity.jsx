export default function RecentActivity({ activities, onViewAll }) {
  const getStatusIcon = (status) => {
    const icons = {
      success: "✅",
      info: "ℹ️", 
      warning: "⚠️",
      error: "🚨"
    };
    return icons[status] || "📋";
  };

  const getStatusColor = (status) => {
    const colors = {
      success: "text-green-600 bg-green-50",
      info: "text-blue-600 bg-blue-50",
      warning: "text-orange-600 bg-orange-50", 
      error: "text-red-600 bg-red-50"
    };
    return colors[status] || "text-gray-600 bg-gray-50";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-accent p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary">Recent Activity</h3>
        <button 
          onClick={onViewAll}
          className="text-sm text-primary opacity-70 hover:opacity-100 font-medium hover:underline"
        >
          View all activity →
        </button>
      </div>

      <div className="space-y-4">
        {activities && activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getStatusColor(activity.status)}`}>
                {getStatusIcon(activity.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary">{activity.user_name}</span>
                  <span className="text-primary opacity-70">scanned</span>
                  <span className="font-medium text-primary">{activity.scan_id}</span>
                </div>
                <p className="text-sm text-primary opacity-70 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-primary opacity-50 mt-1">
                  {formatTime(activity.timestamp)}
                </p>
              </div>

              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                {activity.status === 'success' && 'Processing'}
                {activity.status === 'info' && 'Processing'} 
                {activity.status === 'warning' && 'Processing'}
                {activity.status === 'error' && 'Processing'}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-primary opacity-70">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
