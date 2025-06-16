
export const HealthLegend = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 flex items-center justify-center z-30">
      <div className="flex items-center space-x-6">
        {/* Mangrove Health Legend */}
        <div className="flex items-center space-x-3">
          <span className="text-gray-300 text-sm font-medium">Mangrove Health:</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-600 to-green-600 rounded"></div>
            <span className="text-xs text-gray-400">Degraded</span>
            <span className="text-xs text-gray-400">→</span>
            <span className="text-xs text-gray-400">Healthy</span>
          </div>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-600"></div>

        {/* Impact Legend */}
        <div className="flex items-center space-x-3">
          <span className="text-gray-300 text-sm font-medium">Flood Protection:</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-red-400 rounded opacity-60"></div>
            <span className="text-xs text-gray-400">Low Impact</span>
            <span className="text-xs text-gray-400">→</span>
            <span className="text-xs text-gray-400">High Impact</span>
          </div>
        </div>
      </div>
    </div>
  );
};
