import { axe } from "vitest-axe";
import { BrowserRouter, RouterProvider, createMemoryRouter } from "react-router-dom";
import { FC } from "react";
import userEvent from "@testing-library/user-event";
import { render, waitFor } from "../../test-utils";
import Page from "./Page404";

const TestParent: FC = () => (
  <BrowserRouter>
    <Page />
  </BrowserRouter>
);

describe("404 Page Cases", () => {
  it("should not have any accessibility violations", async () => {
    const { container } = render(<TestParent />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });

  it("should render statically and correctly", () => {
    const { container } = render(<TestParent />);

    expect(container).toMatchSnapshot();
  });

  it("should set the page title to 'Page Not Found'", async () => {
    render(<TestParent />);

    await waitFor(() => expect(document.title).toBe("Page Not Found"));
  });

  it("should navigate home when the 'Return Home' button is clicked", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/404",
          element: <Page />,
        },
        {
          path: "/",
          element: <div>home page</div>,
        },
      ],
      {
        initialEntries: ["/404"],
      }
    );

    const { getByText, getByRole } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(getByText(/page not found/i)).toBeInTheDocument();
    });

    userEvent.click(getByRole("button"));

    await waitFor(() => {
      expect(getByText(/home page/i)).toBeInTheDocument();
    });
  });
});
