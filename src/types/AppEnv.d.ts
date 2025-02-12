type AppEnv = {
  /**
   * NIH SSO Url
   */
  REACT_APP_NIH_AUTHORIZE_URL: string;
  /**
   * NIH SSO Client Id
   */
  REACT_APP_NIH_CLIENT_ID: string;
  /**
   * NIH SSO Redirect Url
   */
  REACT_APP_NIH_REDIRECT_URL: string;
  /**
   * Backend API URL
   *
   * @example "https://example.com/api/graphql"
   */
  REACT_APP_BACKEND_API: string;
  /**
   * Current deployment tier
   *
   * @example DEV2
   * @example PROD
   */
  REACT_APP_DEV_TIER: string;
  /**
   * The latest version of the Uploader CLI tool
   *
   * @example 2.3
   */
  REACT_APP_UPLOADER_CLI_VERSION: string;
  /**
   * Fully-qualified URL to the source package Uploader CLI zip download
   *
   * @example "https://github.com/CBIIT/crdc-datahub-cli-uploader/releases/download/1.0.0/crdc-datahub-cli-uploader.zip"
   */
  REACT_APP_UPLOADER_CLI: string;
  /**
   * Fully-qualified URL to the binary Windows Uploader CLI zip download
   *
   * @example "https://github.com/CBIIT/crdc-datahub-cli-uploader/releases/download/1.0.0/crdc-datahub-cli-uploader-windows.zip"
   */
  REACT_APP_UPLOADER_CLI_WINDOWS: string;
  /**
   * Fully-qualified URL to the binary MacOS x64 Uploader CLI zip download
   *
   * @example "https://github.com/CBIIT/crdc-datahub-cli-uploader/releases/download/1.0.0/crdc-datahub-cli-uploader-mac-x64.zip"
   */
  REACT_APP_UPLOADER_CLI_MAC_X64: string;
  /**
   * Fully-qualified URL to the binary MacOS ARM Uploader CLI zip download
   *
   * @example "https://github.com/CBIIT/crdc-datahub-cli-uploader/releases/download/1.0.0/crdc-datahub-cli-uploader-mac-arm.zip"
   */
  REACT_APP_UPLOADER_CLI_MAC_ARM: string;
  /**
   * Google Analytic (GA4) Tracking ID
   *
   * @example "G-XXXXXXXXXX"
   */
  REACT_APP_GA_TRACKING_ID: string;
  /**
   * Current frontend build tag/version
   *
   * @example "mvp-2.213"
   */
  REACT_APP_FE_VERSION: string;
  /**
   * A CSV string of Data Commons to hide from the UI
   *
   * @note Can be a string of 0 or more Data Commons
   * @since 3.1.0
   */
  REACT_APP_HIDDEN_MODELS: string;
  /**
   * The deployment environment the app is running in
   */
  NODE_ENV?: "test" | "development" | "production";
};
