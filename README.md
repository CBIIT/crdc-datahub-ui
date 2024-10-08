# CRDC Submission Portal

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Coverage Status](https://coveralls.io/repos/github/CBIIT/crdc-datahub-ui/badge.svg?branch=main)](https://coveralls.io/github/CBIIT/crdc-datahub-ui?branch=main)

The CRDC Submission Portal is a React application designed to provide a user-friendly interface for accessing and managing data using various technologies and tools. This project utilizes Node `20.11`, TypeScript, React `v18`, Material-UI `v5`, GraphQL, and Apollo.

## Installation

To run the CRDC Submission Portal project locally, follow these steps:

1. Clone the repository
2. Navigate to the project directory
3. Copy `.env.example` to `.env` and update the environment variables as needed
4. Install the dependencies: `npm ci`
5. Start the development server: `npm start`
6. Open your browser and visit `http://localhost:3010` to access the application.

Please see the instructions in [nginx/README.md](./nginx/README.md) for configuring Nginx.

## Contributing

We use Husky to run a pre-commit hook that will run ESLint and Prettier checks on staged files. If there are any issues, you will need to fix them before you can commit your changes.

If you need to bypass the pre-commit hook, you can use the Git `--no-verify` flag when committing your changes.
These same issues will still be caught by the CI/CD pipeline.
