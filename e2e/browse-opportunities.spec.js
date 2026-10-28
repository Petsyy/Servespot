import { test, expect } from "@playwright/test";

test.describe("Volunteer Browse Opportunities Flow", () => {
  const mockOpportunities = [
    {
      _id: "opp-001",
      title: "Metro Green: Urban Tree Planting",
      organization: { _id: "org-001", orgName: "Bayanihan Foundation" },
      description: "Join us in planting 200 native tree saplings to restore green spaces.",
      location: "Arroceros Forest Park, Manila",
      date: "2026-11-06T08:00:00.000Z",
      duration: "4 hours",
      points: 25,
      status: "Open",
      fileUrl: "/images/opportunities/tree-planting.jpg",
      skills: ["Environment", "Tree Planting"],
      volunteersNeeded: 20,
      volunteers: [],
    },
    {
      _id: "opp-002",
      title: "Emergency Monsoon Relief Distribution",
      organization: { _id: "org-001", orgName: "Bayanihan Foundation" },
      description: "Packing relief boxes with rice, canned goods, and potable water.",
      location: "ServeSpot Operations Center, Pasig City",
      date: "2026-10-31T08:00:00.000Z",
      duration: "6 hours",
      points: 35,
      status: "Open",
      fileUrl: "/images/opportunities/disaster-relief.jpg",
      skills: ["Logistics", "Packing"],
      volunteersNeeded: 25,
      volunteers: [],
    },
    {
      _id: "opp-003",
      title: "Paws & Hope: Animal Shelter Rescue Care",
      organization: { _id: "org-001", orgName: "Bayanihan Foundation" },
      description: "Help rescue dogs and cats with shelter sanitation and feeding routines.",
      location: "Animal Rescue & Adoption Center, Quezon City",
      date: "2026-11-08T09:00:00.000Z",
      duration: "4 hours",
      points: 20,
      status: "Open",
      fileUrl: "/images/opportunities/animal-shelter.jpg",
      skills: ["Animal Care", "Feeding"],
      volunteersNeeded: 8,
      volunteers: [],
    },
  ];

  test.beforeEach(async ({ page, context }) => {
    // Set client cookies for volunteer authentication
    await context.addCookies([
      { name: "role", value: "volunteer", domain: "127.0.0.1", path: "/" },
      { name: "volunteerId", value: "vol-12345", domain: "127.0.0.1", path: "/" },
      { name: "volunteerName", value: "Juan Dela Cruz", domain: "127.0.0.1", path: "/" },
    ]);

    // Mock active volunteer session with authenticated: true
    await page.route("**/api/auth/session**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authenticated: true,
          role: "volunteer",
          user: {
            id: "vol-12345",
            fullName: "Juan Dela Cruz",
            email: "volunteer@servespot.com",
            role: "volunteer",
          },
        }),
      });
    });

    // Intercept opportunities API to guarantee deterministic tests
    await page.route("**/api/opportunities**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockOpportunities),
        });
      } else {
        await route.continue();
      }
    });

    // Mock volunteer profile & endpoints
    await page.route("**/api/volunteer/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          _id: "vol-12345",
          fullName: "Juan Dela Cruz",
          email: "volunteer@servespot.com",
          role: "volunteer",
        }),
      });
    });

    // Keep notifications quiet
    await page.route("**/api/notifications**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
  });

  test("renders Opportunity Board header and displays all cards", async ({ page }) => {
    await page.goto("/volunteer/opportunities");

    // Board header (allow time for initial lazy chunk compilation)
    await expect(page.getByRole("heading", { name: /Opportunity Board/i })).toBeVisible({ timeout: 15000 });

    // Verify all 3 mocked cards render
    await expect(page.getByText("Metro Green: Urban Tree Planting")).toBeVisible();
    await expect(page.getByText("Emergency Monsoon Relief Distribution")).toBeVisible();
    await expect(page.getByText("Paws & Hope: Animal Shelter Rescue Care")).toBeVisible();

    // Verify cover images load
    const images = page.locator("img[alt='Metro Green: Urban Tree Planting']");
    await expect(images.first()).toBeVisible();
  });

  test("filters opportunities by search keyword in real-time", async ({ page }) => {
    await page.goto("/volunteer/opportunities");

    const searchInput = page.getByPlaceholder("Search opportunities...");
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    // Search for "Monsoon"
    await searchInput.fill("Monsoon");

    // Only Monsoon opportunity should be visible
    await expect(page.getByText("Emergency Monsoon Relief Distribution")).toBeVisible();
    await expect(page.getByText("Metro Green: Urban Tree Planting")).not.toBeVisible();
    await expect(page.getByText("Paws & Hope: Animal Shelter Rescue Care")).not.toBeVisible();

    // Clear search
    await searchInput.fill("");
    await expect(page.getByText("Metro Green: Urban Tree Planting")).toBeVisible();
    await expect(page.getByText("Paws & Hope: Animal Shelter Rescue Care")).toBeVisible();
  });

  test("shows empty state when no opportunities match filter query", async ({ page }) => {
    await page.goto("/volunteer/opportunities");

    const searchInput = page.getByPlaceholder("Search opportunities...");
    await searchInput.fill("NonExistentQueryXYZ123");

    // Empty state message
    await expect(page.getByText(/No opportunities found/i)).toBeVisible();
  });

  test("opens opportunity detail modal on clicking 'View Details'", async ({ page }) => {
    await page.goto("/volunteer/opportunities");

    // Click "View Details" on the first card
    const viewDetailsButtons = page.getByRole("button", { name: /View Details/i });
    await viewDetailsButtons.first().click();

    // Modal header shows title and organization
    await expect(page.locator("div.fixed h2").filter({ hasText: "Metro Green: Urban Tree Planting" })).toBeVisible();
    await expect(page.getByText(/Organization:/i).first()).toBeVisible();
  });
});
