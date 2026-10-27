export const queryKeys = {
  auth: {
    session: ["auth", "session"],
  },
  admin: {
    all: ["admin"],
    profile: (id) => ["admin", "profile", id],
    dashboard: ["admin", "dashboard"],
    notifications: (id) => ["admin", "notifications", id],
    reports: ["admin", "reports"],
    users: ["admin", "users"],
  },
  volunteers: {
    all: ["volunteers"],
    profile: (id) => ["volunteers", "profile", id],
    notifications: (id) => ["volunteers", "notifications", id],
    tasks: (id) => ["volunteers", "tasks", id],
    badges: (id) => ["volunteers", "badges", id],
    overview: (id) => ["volunteers", "overview", id],
    progress: (id) => ["volunteers", "progress", id],
    top: () => ["volunteers", "top"],
  },
  organizations: {
    all: ["organizations"],
    profile: (id) => ["organizations", "profile", id],
    dashboard: (id) => ["organizations", "dashboard", id],
    opportunities: (id) => ["organizations", "opportunities", id],
    notifications: (id) => ["organizations", "notifications", id],
    stats: (id) => ["organizations", "stats", id],
  },
  opportunities: {
    all: ["opportunities"],
    list: (filters = {}) => ["opportunities", "list", filters],
    detail: (id) => ["opportunities", "detail", id],
    volunteers: (id) => ["opportunities", id, "volunteers"],
  },
  locations: {
    regions: ["locations", "regions"],
    provinces: (regionCode) => ["locations", "provinces", regionCode],
    cities: (regionCode, provinceCode) => [
      "locations",
      "cities",
      regionCode,
      provinceCode,
    ],
    barangays: (cityCode) => ["locations", "barangays", cityCode],
  },
};

export default queryKeys;

