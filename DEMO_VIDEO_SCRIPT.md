# CareerTrack Lite Demo Video Script

Target length: 3 to 5 minutes.

## Before Recording

- Open the live frontend in an incognito window.
- Confirm the backend health endpoint returns a success response.
- Confirm `demo@gmail.com` / `demo1234` can log in.
- Keep the GitHub repository and MongoDB Atlas collection open in separate tabs.
- Do not show `.env`, database passwords, JWT secrets, or connection strings.

## 0:00-0:30 - Introduction

Say:

> Hello, I am [YOUR NAME], student ID [YOUR STUDENT ID]. This is CareerTrack Lite, a full-stack job application tracker built with React, Express, MongoDB, JWT, and bcryptjs.

Show the live frontend URL and briefly mention that each user can access only their own applications.

## 0:30-1:05 - Authentication

1. Show the registration page.
2. Explain the client-side validation and disabled loading button.
3. Log in with the demo account.
4. Show that the dashboard is protected.
5. Briefly mention that passwords are hashed and JWT protects private API routes.

## 1:05-2:10 - Application CRUD

1. Add a new application with company, title, URL, source, date, status, and notes.
2. Show the new application in the list.
3. Edit its status or notes.
4. Delete an application and show the confirmation prompt.
5. Mention that every database query checks the logged-in user's ID.

## 2:10-2:40 - Dashboard and Search

1. Show total and status statistic cards.
2. Show recently added applications.
3. Search by company or job title.
4. Demonstrate status/source filters and newest/oldest sorting.

## 2:40-3:25 - Code and Database

1. Show the `client/src` component and page structure.
2. Show the auth middleware and one ownership-protected application query.
3. Show the MongoDB users and applications collections without revealing secrets.
4. Show the GitHub commit history and README.

## 3:25-4:05 - Challenge, Database Choice, and AI Use

Say:

> One issue I faced was connecting and deploying the frontend and backend with CORS and serverless configuration. I solved it by using environment-based API URLs, an allowed-origin list, a health endpoint, and a serverless-compatible Express export.

Explain the genuine PostgreSQL attempt. Mention what was tried, the problem encountered, solutions attempted, and why MongoDB was selected to finish a complete working project within the deadline.

Say:

> I used AI tools for planning, frontend assistance, code review, and debugging. I reviewed the generated code and understand the authentication, CRUD, and ownership flow.

## 4:05-4:20 - Closing

Show the deployed application one final time and say:

> The GitHub repository, live frontend, live backend, demo video, and test credentials are included in my submission. Thank you.

## Final Video Checklist

- Keep the recording between 3 and 5 minutes.
- Make text and code readable.
- Do not reveal any secrets.
- Upload to Google Drive, YouTube Unlisted, or Loom.
- Open the video link in incognito mode to confirm public access.
- Add the final video link to the README and submission form.
