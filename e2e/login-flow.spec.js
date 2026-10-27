import { test, expect } from "@playwright/test";

test.describe("Authentication & Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Default: no active session
    await page.route("**/api/auth/session**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "No active session" }),
      });
    });
    // Notifications mock
    await page.route("**/api/notifications**", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    });
  });

  test("renders the volunteer login form elements properly", async ({ page }) => {
    await page.goto("/volunteer/login");

    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(page.getByText(/Volunteer Login/i)).toBeVisible();
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("validates invalid email format on client-side", async ({ page }) => {
    await page.goto("/volunteer/login");

    const emailInput = page.getByPlaceholder("Enter your email");
    const submitBtn = page.getByRole("button", { name: "Sign In" });

    // Enter invalid email
    await emailInput.fill("invalid-email-format");
    await submitBtn.click();

    // Expect schema error message to display
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  });

  test("shows toast error when API rejects credentials", async ({ page }) => {
    // Intercept volunteer login with 401
    await page.route("**/api/auth/volunteer/login**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Invalid email or password" }),
      });
    });

    await page.goto("/volunteer/login");

    await page.getByPlaceholder("Enter your email").fill("wrong@servespot.com");
    await page.getByPlaceholder("Enter your password").fill("WrongPass123!");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Verify toast or alert appears with the rejection message
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  });

  test("successfully signs in and transitions to volunteer homepage", async ({ page }) => {
    let sessionRole = null;

    // Handle login mutation
    await page.route("**/api/auth/volunteer/login**", async (route) => {
      sessionRole = "volunteer";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "Set-Cookie": "authToken=mock-jwt-token; Path=/; HttpOnly",
        },
        body: JSON.stringify({
          token: "mock-jwt-token",
          user: {
            id: "vol-12345",
            fullName: "Juan Dela Cruz",
            email: "volunteer@servespot.com",
            role: "volunteer",
          },
        }),
      });
    });

    // Dynamic session endpoint based on login state
    await page.route("**/api/auth/session**", async (route) => {
      if (sessionRole === "volunteer") {
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
      } else {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "No active session" }),
        });
      }
    });

    await page.goto("/volunteer/login");

    await page.getByPlaceholder("Enter your email").fill("volunteer@servespot.com");
    await page.getByPlaceholder("Enter your password").fill("Password123!");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Verify navigation to volunteer homepage
    await expect(page).toHaveURL(/\/volunteer\/homepage/);
  });
});
