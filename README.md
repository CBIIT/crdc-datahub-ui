# CRDC Data Hub

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

CRDC Data Hub is a React application designed to provide a user-friendly interface for accessing and managing data using various technologies and tools. This project utilizes TypeScript, React v18, Material-UI v5, ESLint, React Router DOM, GraphQL, and Apollo.

## Installation

To run the CRDC Data Hub project locally, follow these steps:

1. Clone the repository
2. Navigate to the project directory
3. Install the dependencies: `npm ci`
4. Start the development server: `npm start`
5. Open your browser and visit `http://localhost:3000` to access the application.

Please see the instructions in [nginx/README.md](./nginx/README.md) for configuring Nginx.

## Contributing

We use Husky to run a pre-commit hook that will run ESLint and Prettier on staged files. If there are any issues, you will need to fix them before you can commit your changes.

If you need to bypass the pre-commit hook, you can use the Git `--no-verify` flag when committing your changes.
These same issues will still be caught by the CI/CD pipeline.
