# CareerTrack Lite

CareerTrack Lite is a simple full-stack job application tracker. Users can create an account, log in, and manage only their own job applications.

## Features

- User registration and login with JWT authentication
- Password hashing with bcryptjs
- Protected frontend and backend routes
- Create, view, update and delete job applications
- User ownership protection for every application
- Dashboard statistics and recently added applications
- Search by company or job title
- Filter by status and source
- Sort by newest or oldest
- Responsive pages with loading, error and empty states

## Technology Stack

### Frontend

- React
- React Router
- Vite
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- JWT
- bcryptjs

## Project Structure

```text
careertrack-lite/
|-- client/    React frontend
|-- server/    Express REST API
`-- README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/jalal-uddin-sharif/careertrack-lite.git
cd careertrack-lite
```

### 2. Set up the backend

```bash
cd server
npm install
```

Copy `server/.env.example` to `server/.env` and add your values:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

Open another terminal:

```bash
cd client
npm install
```

Copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the logged-in user |
| POST | `/api/applications` | Create an application |
| GET | `/api/applications` | Get personal applications |
| GET | `/api/applications/:id` | Get one personal application |
| PATCH | `/api/applications/:id` | Update a personal application |
| DELETE | `/api/applications/:id` | Delete a personal application |
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/health` | Check API health |

Protected endpoints require this header:

```text
Authorization: Bearer YOUR_TOKEN
```

## Live Links

- Frontend: https://careertracklite.vercel.app
- Backend API: https://careertrackliteserver.vercel.app
- API health: https://careertrackliteserver.vercel.app/api/health

## Test Account

- Email: `demo@gmail.com`
- Password: `demo1234`

## AI Tools Used

AI tools were used for planning, frontend assistance, code review and debugging. All code was reviewed and can be explained by the developer.

## Current Limitations

- The project uses MongoDB instead of the preferred PostgreSQL database.
- The demonstration video link is not added yet.
- Automated tests are not added yet.

## Future Improvements

- Add PostgreSQL and Prisma
- Add email verification and password reset
- Add pagination for large application lists
- Add optional AI job-description analysis
