# Ponchador RM - Time Clock App

This is a modern, responsive time clock application built with Next.js, TypeScript, Tailwind CSS, ShadCN UI, and Genkit for AI features. It provides a simple interface for users to clock in and out, and a dashboard for viewing time reports.

## Features

- **User Authentication**: Simple PIN-based user identification.
- **Time Tracking**: Easy clock-in and clock-out functionality.
- **Reporting Dashboard**: Visual charts and tables for analyzing worked hours.
- **Responsive Design**: Works on desktops, tablets, and mobile devices.
- **Inactivity Timeout**: Securely logs out the user after a period of inactivity.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js) or another package manager like [Yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/).

### Installation

1.  **Clone the repository**
    First, clone the repository to your local machine. If you haven't renamed it, it might still be under the original name.

    ```bash
    git clone https://github.com/your-username/timeclock.git
    cd timeclock
    ```

2.  **Install dependencies**
    Navigate to the project directory and install the required npm packages.

    ```bash
    npm install
    ```

3.  **Set up environment variables**
    This project uses Genkit for AI functionalities, which requires an API key. Create a new file named `.env.local` in the root of your project and add your Gemini API key.

    ```bash
    # .env.local
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```
    You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

1.  **Start the development server**
    To run the application in development mode, use the following command. This will start the Next.js app on `http://localhost:9002`.

    ```bash
    npm run dev
    ```

2.  **Start the Genkit development server (Optional)**
    If you are developing or testing AI flows, you'll want to run the Genkit development UI. This allows you to inspect and test your flows separately.

    ```bash
    npm run genkit:watch
    ```
    The Genkit UI will be available at `http://localhost:4000`.

### Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Creates a production-ready build of the application.
- `npm run start`: Starts the production server (requires a build first).
- `npm run lint`: Lints the codebase for errors and style issues.
- `npm run genkit:dev`: Starts the Genkit development server once.
- `npm run genkit:watch`: Starts the Genkit server in watch mode, automatically reloading on changes.
