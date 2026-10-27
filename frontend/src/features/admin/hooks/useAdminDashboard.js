import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "@/features/admin/services/admin.api";
import { queryKeys } from "@/shared/services/queryKeys";

export function useAdminDashboard() {
  const query = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: async () => {
      const res = await getAdminDashboard();
      return res?.data || {};
    },
    staleTime: 1000 * 60 * 2,
  });

  const data = query.data || {};

  const stats = {
    totalVolunteers: data.totalVolunteers ?? 0,
    totalOrganizations: data.totalOrganizations ?? 0,
    activeOpportunities: data.activeOpportunities ?? 0,
    completedOpportunities: data.completedOpportunities ?? 0,
  };

  const chartData = {
    weeklyActivity: Array.isArray(data.weeklyActivity) ? data.weeklyActivity : [],
    weeklyTasks: Array.isArray(data.weeklyTasks) ? data.weeklyTasks : [],
  };

  return {
    ...query,
    stats,
    chartData,
  };
}

export default useAdminDashboard;

