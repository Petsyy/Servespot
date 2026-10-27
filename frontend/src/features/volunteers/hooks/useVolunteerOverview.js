import { useQuery } from "@tanstack/react-query";
import { getVolunteerOverview } from "@/features/volunteers/services/volunteer.api";
import { queryKeys } from "@/shared/services/queryKeys";
import { getCookie } from "@/shared/utils/cookies";

export function useVolunteerOverview() {
  const volunteerId = getCookie("volunteerId");
  return useQuery({
    queryKey: queryKeys.volunteers.overview(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerOverview();
      return res?.data || null;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export default useVolunteerOverview;

