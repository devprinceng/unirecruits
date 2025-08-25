# UniRecruits - University Staff Recruitment & Promotion Management System

This is a Next.js application built with Firebase Studio. It serves as the frontend for UniRecruits, a comprehensive system for managing university staff recruitment and promotions.

## Features

- **Public Landing Page**: A welcoming page with university branding, an about section, and a list of the latest job openings.
- **Job Listings & Applications**: Guests can view detailed job descriptions and apply directly through the portal.
- **Role-Based Access**: Secure authentication for different user roles (Admin, Staff).
- **Admin Dashboard**: A powerful interface for administrators to manage staff, recruitments, applications, and promotion requests.
- **Staff Dashboard**: A personal dashboard for staff members to submit and track their promotion requests.
- **Smart Skill Classifier**: An AI-powered tool that automatically analyzes job descriptions to identify and tag required skills, streamlining the recruitment process.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: React Context
- **AI**: [Google's Gemini model via Genkit](https://firebase.google.com/docs/genkit)

## Getting Started

To get started with the development environment:

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:9002`.
