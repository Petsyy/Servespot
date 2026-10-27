// import React from "react";

// const Bar = ({ label, value, color }) => (
//   <div>
//     <div className="flex justify-between text-sm text-gray-700">
//       <span>{label}</span><span className="font-medium">{value}%</span>
//     </div>
//     <div className="h-2 w-full bg-gray-100 rounded mt-1">
//       <div className={`h-2 rounded ${color}`} style={{ width: `${value}%` }} />
//     </div>
//   </div>
// );

// export default function ImpactSummary({ stats }) {
//   const s = stats || { completion: 94, retention: 87, goal: 76 };
//   return (
//     <div className="bg-white rounded-xl shadow-sm p-5">
//       <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Summary</h3>
//       <div className="space-y-4">
//         <Bar label="Task Completion" value={s.completion} color="bg-green-500"/>
//         <Bar label="Volunteer Retention" value={s.retention} color="bg-blue-500"/>
//         <Bar label="Monthly Goal" value={s.goal} color="bg-orange-500"/>
//       </div>
//     </div>
//   );
// }
