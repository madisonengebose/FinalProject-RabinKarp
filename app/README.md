# Keyword Detector Frontend

React frontend for the Keyword Detection API using Rabin-Karp Algorithm.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

- **Add Keywords**: Add keywords to detect (comma-separated)
- **Detect Keywords**: Enter email text(s) and detect keywords using the Rabin-Karp algorithm
- **View Results**: See which keywords were found and at what word positions

## API Configuration

The frontend connects to the backend API at `http://localhost:8003` by default. 
Make sure your FastAPI backend is running on that port.

To change the API URL, edit `src/services/api.js` and update the `API_BASE_URL` constant.

