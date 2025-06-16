
interface TooltipProps {
  x: number;
  y: number;
  visible: boolean;
  content: any;
}

export const Tooltip = ({ x, y, visible, content }: TooltipProps) => {
  if (!visible || !content) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { color: 'bg-green-500', text: 'Verified', icon: '✓' },
      pending_verification: { color: 'bg-yellow-500', text: 'Pending', icon: '⏳' },
      under_review: { color: 'bg-red-500', text: 'Review', icon: '🔍' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.under_review;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getThreatBadge = (level: string) => {
    const threatConfig = {
      low: { color: 'bg-green-600', text: 'Low Risk', icon: '🟢' },
      medium: { color: 'bg-yellow-600', text: 'Medium Risk', icon: '🟡' },
      high: { color: 'bg-red-600', text: 'High Risk', icon: '🔴' }
    };
    
    const config = threatConfig[level as keyof typeof threatConfig] || threatConfig.medium;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      critical: { color: 'bg-red-700', text: 'Critical', icon: '🚨' },
      urgent: { color: 'bg-orange-600', text: 'Urgent', icon: '⚠️' },
      high: { color: 'bg-blue-600', text: 'High', icon: '📈' },
      important: { color: 'bg-purple-600', text: 'Important', icon: '⭐' },
      moderate: { color: 'bg-gray-600', text: 'Moderate', icon: '📊' },
      stable: { color: 'bg-green-700', text: 'Stable', icon: '✅' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.moderate;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  return (
    <div
      className="fixed z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg p-4 shadow-2xl transition-opacity duration-200 pointer-events-none max-w-sm"
      style={{
        left: x + 15,
        top: y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="text-white space-y-3">
        {/* Header */}
        <div className="border-b border-gray-700 pb-2">
          <div className="font-semibold text-sm mb-1">{content.name}</div>
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span>📍 {content.country}</span>
            {content.region && <span className="text-blue-400">{content.region}</span>}
          </div>
        </div>

        {/* Status and Health */}
        <div className="flex items-center justify-between">
          {getStatusBadge(content.status)}
          <div className="text-right">
            <div className="text-xs text-gray-400">Health Index</div>
            <div className={`font-semibold text-lg ${
              content.health > 0.8 ? 'text-green-400' : 
              content.health > 0.6 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {content.health.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Conservation Status */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Threat Level:</span>
            {getThreatBadge(content.threat_level)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Priority:</span>
            {getPriorityBadge(content.conservation_priority)}
          </div>
        </div>

        {/* Area and Impact */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-gray-400">Area</div>
            <div className="text-green-400 font-semibold">
              {content.area_hectares?.toLocaleString()} ha
            </div>
          </div>
          <div>
            <div className="text-gray-400">Funded</div>
            <div className="text-green-400 font-semibold">
              ${content.funded_amount?.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Trees Planted</div>
            <div className="text-blue-400 font-semibold">
              {content.planted_trees?.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Impact Rate</div>
            <div className="text-purple-400 font-semibold">
              {content.area_hectares && content.planted_trees ? 
                Math.round(content.planted_trees / content.area_hectares * 100) / 100 : 0} trees/ha
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
          🌍 {content.lat.toFixed(4)}°N, {content.lng.toFixed(4)}°E
        </div>
      </div>
      
      {/* Arrow */}
      <div className="absolute top-full left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  );
};
