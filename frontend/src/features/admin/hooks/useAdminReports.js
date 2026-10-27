import { useQuery } from "@tanstack/react-query";
import API from "@/shared/services/api";
import { queryKeys } from "@/shared/services/queryKeys";

export function useAdminReports() {
  const query = useQuery({
    queryKey: queryKeys.admin.reports,
    queryFn: async () => {
      const { data } = await API.get("/admin/reports");
      return data || null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    ...query,
    reportsData: query.data || null,
  };
}

export default useAdminReports;

