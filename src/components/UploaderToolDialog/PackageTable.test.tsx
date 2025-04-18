import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import PackageTable from "./PackageTable";
import packageConfig from "../../config/PackageTableConfig";

jest.mock("../../env", () => ({
  ...jest.requireActual("../../env"),
  REACT_APP_UPLOADER_CLI: "https://github.com/.../fake-release/crdc-datahub-cli-uploader.zip",
  REACT_APP_UPLOADER_CLI_WINDOWS:
    "https://github.com/.../fake-release/crdc-datahub-cli-uploader-windows.zip",
  REACT_APP_UPLOADER_CLI_MAC_X64:
    "https://github.com/.../fake-release/crdc-datahub-cli-uploader-mac-x64.zip",
  REACT_APP_UPLOADER_CLI_MAC_ARM:
    "https://github.com/.../fake-release/crdc-datahub-cli-uploader-mac-arm.zip",
}));

type ParentProps = {
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ children }) => (
  <MemoryRouter basename="">{children}</MemoryRouter>
);

describe("Accessibility", () => {
  it("should have no violations", async () => {
    const { container } = render(
      <TestParent>
        <PackageTable />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    const { getByTestId } = render(
      <TestParent>
        <PackageTable />
      </TestParent>
    );

    expect(getByTestId("package-table-container")).toBeVisible();
  });

  it("should render all rows correctly with CLI download links", () => {
    const { getByTestId } = render(
      <TestParent>
        <PackageTable />
      </TestParent>
    );

    packageConfig.forEach((pkg) => {
      expect(getByTestId(`package-type-${pkg.fileName}`).textContent).toBe(pkg.packageType);
      expect(getByTestId(`package-platform-${pkg.fileName}`).textContent).toBe(pkg.platform);

      const textDownload = getByTestId(`package-table-text-download-${pkg.fileName}`);
      expect(textDownload.textContent).toBe(pkg.fileName);
      expect(textDownload).toHaveAttribute("href", pkg.downloadURL);
      expect(textDownload).toHaveAttribute("download");
      expect(textDownload).toHaveAttribute("target", "_self");

      userEvent.click(textDownload);

      const iconDownload = getByTestId(`package-table-icon-download-${pkg.fileName}`);
      expect(iconDownload).toBeVisible();
      expect(iconDownload).toHaveAttribute("href", pkg.downloadURL);
      expect(iconDownload).toHaveAttribute("download");
      expect(iconDownload).toHaveAttribute("target", "_self");
    });
  });
});
