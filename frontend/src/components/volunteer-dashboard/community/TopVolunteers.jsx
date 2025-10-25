import React from "react";
import { Trophy, Crown, Medal, Award } from "lucide-react";

export default function TopVolunteers({ items = [], loading }) {
  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown size={16} className="text-yellow-500" />;
      case 1: return <Medal size={16} className="text-gray-400" />;
      case 2: return <Award size={16} className="text-amber-600" />;
      default: return <Trophy size={16} className="text-green-500" />;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return "from-yellow-400 to-amber-500";
      case 1: return "from-gray-400 to-gray-500";
      case 2: return "from-amber-500 to-orange-500";
      default: return "from-green-400 to-emerald-500";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Volunteers</h3>
        {items.length > 0 && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            Top {items.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((v, i) => (
            <div
              key={v.id || i}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRankColor(i)} flex items-center justify-center text-white text-sm font-bold`}>
                {i < 3 ? getRankIcon(i) : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {v.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-600 font-medium">{v.points} points</p>
                  {v.completedTasks && (
                    <p className="text-xs text-gray-500">• {v.completedTasks} tasks</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-6">
              <Trophy size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500 font-medium">No leaderboard yet</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to earn points!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}