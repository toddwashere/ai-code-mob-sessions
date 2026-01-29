import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "@/components/auth/login-form";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(() => Promise.resolve({ ok: true, error: null })),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("LoginForm", () => {
  it("renders email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows error when submitting empty form", async () => {
    render(<LoginForm />);

    const form = screen.getByRole("button", { name: /sign in/i }).closest("form");
    if (form) {
      fireEvent.submit(form);
    }

    // Either validation error or invalid credentials (depending on form state)
    expect(await screen.findByText(/please enter both email and password|invalid email or password/i)).toBeInTheDocument();
  });
});
