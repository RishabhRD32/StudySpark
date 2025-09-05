# StudySpark: AI-Powered Student Dashboard

StudySpark is a modern, all-in-one dashboard designed to help students organize their academic life, study smarter, and boost their productivity using the power of AI. Built with Next.js, Firebase, and Google's Genkit, it provides a seamless and intelligent experience.

## ✨ Key Features

*   **Smart Dashboard:** A comprehensive overview of your academic progress, including upcoming assignments, weekly schedule, and study stats.
*   **Subjects & Assignments:** Organize all your courses, track assignments with due dates and grades, and manage your progress.
*   **AI-Powered Tools:**
    *   **AI Tutor:** Get instant help and explanations for complex topics by providing context from your course materials.
    *   **AI Summarizer:** Condense long articles, notes, or documents into concise summaries.
    *   **Quiz Generator:** Automatically create multiple-choice quizzes from your study materials to test your knowledge.
*   **Personalized Study Planner:** Generate weekly study plans based on your selected subjects and available study hours.
*   **Interactive Timetable:** Manage your weekly schedule for lectures and view written and practical exam dates in a calendar format.
*   **Study Materials Hub:** Upload and categorize your notes, practicals, and past papers. You can keep them private or share them publicly.
*   **Public Material Search:** Discover and use study notes shared by other students in the community.
*   **Secure Authentication & Profiles:** Robust user authentication with email/password, with customizable user profiles and avatars.
*   **Modern, Responsive UI:** A clean, themeable (light/dark mode) interface built with ShadCN UI and Tailwind CSS.

## 🚀 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Authentication, Storage)
*   **Generative AI:** [Google AI & Genkit](https://firebase.google.com/docs/genkit)
*   **Deployment:** [Vercel](https://vercel.com)

## Firebase Setup

This project is configured to work with Firebase. To run it locally or deploy it, you will need a Firebase project.

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Services:** In your new project, enable the following services:
    *   **Authentication:** Enable the "Email/Password" sign-in provider.
    *   **Firestore Database:** Create a new Firestore database in production mode.
    *   **Storage:** Enable Cloud Storage.
3.  **Get Config:** In your project settings, find your web app's Firebase configuration object and place it in `src/lib/firebase.ts`.
4.  **Security Rules:** Copy the contents of `firestore.rules` from this project and paste them into the "Rules" tab of your Firestore Database in the Firebase Console. Publish the rules.

## Environment Variables

You will need an API key from Google AI Studio to use the generative AI features.

1.  Visit [Google AI Studio](https://aistudio.google.com/) to create an API key.
2.  Create a `.env.local` file in the root of the project.
3.  Add your API key to the `.env.local` file:

    ```
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```
    
## Running Locally with VS Code

To run this application on your local machine using Visual Studio Code, follow these steps:

1.  **Open the project in VS Code.**
2.  **Install dependencies:** Open the integrated terminal (you can use `Ctrl+\` `` ` ``) and run the following command:
    ```bash
    npm install
    ```
3.  **Start the development server:** Once the installation is complete, run the following command in the same terminal:
    ```bash
    npm run dev
    ```
4.  **Open the app:** The application will be running at `http://localhost:9002`. You can open this URL in your web browser to see the app.
