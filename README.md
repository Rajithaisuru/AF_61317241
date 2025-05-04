# CountryExplorer - React Frontend Application

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mNaxAqQD)

---

**Application Frameworks - SE3040**  
**Frontend Project Assignment 02**  

**Name:** Subasinghe M.H.R.I.  

---

## Overview

CountryExplorer is a modern React application that allows users to explore countries around the world using the REST Countries API.  
It demonstrates advanced React functional component usage, API integration, session management, responsive design, and comprehensive testing.

---

## Live Demo

View Live Demo -https://af-61317241-git-main-rajitha-isurus-projects.vercel.app/


## Features

- 🌍 Browse all countries with detailed information (name, population, region, languages, flag, capital)
- 🔍 Search countries by name
- 🌐 Filter countries by region
- 🗺️ Interactive map integration (Leaflet)
- 📊 Compare countries side-by-side
- 💖 Add countries to favorites (requires login)
- 👤 User authentication and profile management
- 🎨 Dark/Light theme support
- 📱 Responsive design for all devices
- 🧪 Comprehensive unit and integration tests (Vitest + React Testing Library)
- 🚀 Modern UI with Bootstrap

## Technology Stack

**Frontend:**
- React (Functional Components & Hooks)
- JavaScript (ES6+)
- Bootstrap (CSS Framework)
- React Router (Routing)
- Axios (API calls)
- Vite (Build tooling)
- Vitest & React Testing Library (Testing)
- Leaflet & React-Leaflet (Map integration)

**Backend:**
- Node.js, Express.js
- MongoDB (User management)
- JWT (Authentication)
- Mongoose (Database operations)

## API Integration

### REST Countries API Endpoints Used

- `GET /all` — Fetch all countries
- `GET /name/{name}` — Search countries by name
- `GET /region/{region}` — Filter countries by region
- `GET /alpha/{code}` — Get detailed country information

**Example Usage:**
- Home page and country list: `/all`
- Country detail: `/alpha/{code}`
- Search: `/name/{name}`
- Favorites/Profile: `/alpha/{code}?fields=name,cca2,flags,region,population,capital,languages`

### Backend API Endpoints

- **Register:** `POST /api/auth/register`
- **Login:** `POST /api/auth/login`
- **Profile:** `GET /api/auth/me` (requires Bearer token)
- **Add Favorite:** `POST /api/favorites/add` 
(requires Bearer token)
- **Get Favorites:** `GET /api/favorites` (requires Bearer token)
- **Remove Favorite:** `DELETE /api/favorites/remove/:countryCode` (requires Bearer token)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (for backend)
- Vercel CLI (for deployment)

### Installation

1. **Clone the repository:**
    git clone [your-repository-url]

2. **Install frontend dependencies:**
    cd frontend
    npm install

3. **Install backend dependencies:**
    cd ../backend
    npm install

4. **Configure environment variables for backend:**
    - Create a `.env` file in the `backend` directory:

      MONGODB_URI=your_mongodb_uri
      JWT_SECRET=your_jwt_secret
      PORT=5005

### Running the Application

1. **Start the backend server:**
    cd backend
    npm run dev

2. **Start the frontend development server:**
    cd frontend
    npm run dev
  
    The app will be available at [http://localhost:5173](http://localhost:5173)

---

## Testing

The project uses **Vitest** and **React Testing Library** for unit and integration tests.

To run all tests:
cd frontend
npm test


## Deployment

The application is deployed on [Vercel](https://vercel.com/).

**To deploy:**

1. **Install Vercel CLI:**
    npm install -g vercel

2. **Deploy frontend:**
    cd frontend
    vercel

3. **Deploy backend:**
    cd backend
    vercel

## Challenges Faced and Solutions

1. **Country API Issues:**  
   - *Challenge:* When i tried to access country API it not work. 
   - *Solution:* As solution I was waited until fix it.

2. **Difficult to configuration with Tailwind CSS:**  
   - *Challenge:* Initially I was tried to use Tailwind CSS. But there were many issue occurs to configure. As a result, I wasted lot of time for project development. 
   - *Solution:* Finally I used Boostarp. It was easy to use.

3. **Map integration:**  
   - *Challenge:* Integrating Leaflet maps with React and handling dynamic updates.
   - *Solution:* Used `react-leaflet` for seamless React integration and optimized re-renders.

4. **Testing implementation:**  
   - *Challenge:* It was faced lot of challanges when developed the test cases for specially Home page like componenents.
   - *Solution:* Used Vitest and React Testing Library with mock API responses for robust test coverage.

5. **Deployment Issues:**  
   - *Challenge:* :** Initially, I tried to used Render platform. But it is not user friendly. Finally I was used vercel. (But it has 100 codes limits).Configuring Vercel deployment for both frontend and backend services. 
   - *Solution:* Used Vercel with separate frontend and backend deployments, and managed environment variables securely.

6. **Cross-Browser & Device Compatibility:**  
   - *Challenge:* Ensuring consistent experience across browsers and devices.
   - *Solution:* Used Bootstrap’s responsive utilities and tested on multiple browsers/devices.


## Version Control & Contribution

- The project uses Git for version control.
- Regular and meaningful commits are made throughout development.
- To contribute:
    1. Fork the repository
    2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
    3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
    4. Push to the branch (`git push origin feature/AmazingFeature`)
    5. Open a Pull Request

**Live Demo:**  
[https://af-61317241-git-main-rajitha-isurus-projects.vercel.app/](https://af-61317241-git-main-rajitha-isurus-projects.vercel.app/)


