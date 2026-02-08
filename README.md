# Peer-Feedback-Exchange

A **Peer Feedback Platform** for Boston University students. Students can exchange feedback on coursework and collaborate to improve their learning through structured peer review.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

```bash
cd "Peer Review Webapp Wireframes"
npm install
```

### Run the app

```bash
npm run dev
```

Open the URL shown in the terminal (e.g. `http://localhost:5173`).

## Routes

| Path | Description |
|------|-------------|
| `/login` | Login page. Choose Student or Professor to sign in. |
| `/students` | Student dashboard (submissions, feedback received/provided, all feedback). |
| `/students/submit` | Submit work for peer review. |
| `/students/review` | Review assignments and provide feedback. |
| `/students/feedback` | View feedback on a submission (opened from dashboard). |
| `/professor` | Professor dashboard (overview, submissions table, analytics). |

- Not logged in: visiting any path other than `/login` redirects to `/login`.
- After login, you are redirected to `/students` (student) or `/professor` (professor).
- Student and professor views are separate; each role only sees their own dashboard.

## Features

- **Student:** Submit work, get assigned peer reviews, complete reviews for peers, view all feedback (with scrollable submission lists).
- **Professor:** View all submissions, filter by course/team/status, open submission details and peer reviews (scrollable), view analytics (top projects, courses, reviewers).
- **Attributed feedback:** Submitter and reviewer names are shown (no anonymous feedback).
- **Scrollable lists:** Submission tables and feedback sections use scrollable containers to handle many items.

## Tech Stack

- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Radix UI, Lucide icons
