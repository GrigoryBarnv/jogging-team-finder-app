# Frontend Setup

This folder contains a standalone `React + Vite` frontend for the Spring Boot API in the parent project.

## What it does

- Runs a React development server on `http://localhost:5173`
- Proxies `/api/*` requests to the Spring backend on `http://localhost:8080`
- Starts with a simple dashboard that reads `GET /api/runs`

## Install dependencies

```powershell
cd frontend
npm.cmd install
```

## Start the backend

In one terminal, from the project root:

```powershell
.\mvnw.cmd spring-boot:run
```

If you do not use Maven Wrapper, use your local Maven installation.

## Start the frontend

In a second terminal:

```powershell
cd frontend
npm.cmd run dev
```

## Build for production

```powershell
cd frontend
npm.cmd run build
```

The output will be written to `frontend/dist/`.
