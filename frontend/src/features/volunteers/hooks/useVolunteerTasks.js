import { useQuery } from "@tanstack/react-query";
import { getVolunteerTasks } from "@/features/volunteers/services/volunteer.api";
import { queryKeys } from "@/shared/services/queryKeys";
import { getCookie } from "@/shared/utils/cookies";

export function useVolunteerTasks() {
  const volunteerId = getCookie("volunteerId");
  const query = useQuery({
    queryKey: queryKeys.volunteers.tasks(volunteerId),
    queryFn: async () => {
      const res = await getVolunteerTasks();
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const all = query.data || [];
  const active = all.filter(
    (t) =>
      t.status === "Open" ||
      t.status === "In Progress" ||
      t.status === "Pending"
  );
  const completed = all.filter(
    (t) =>
      t.status === "Completed" ||
      t.status === "Approved" ||
      t.status === "Rejected"
  );

  return {
    ...query,
    tasks: { all, active, completed },
  };
}

export default useVolunteerTasks;

