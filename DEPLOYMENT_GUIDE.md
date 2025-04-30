# Deployment Guide: Medical Interpreter Application

This guide explains how to deploy the Medical Interpreter application using free resources.

## Overview

The application consists of:
- React frontend (client)
- Node.js backend (server)
- MongoDB database

We'll use these free services:
- **Vercel**: For the React frontend
- **Render**: For the Node.js backend
- **MongoDB Atlas**: For the database

## 1. Preparing the Application

Before deploying, make the following changes to prepare your application:

### Environment Variables Setup

1. Create production environment files without committing them to Git
2. Ensure your backend URL is properly referenced in the frontend

### Client-Side Configuration

Update your client's package.json to include a build script:

```json
"scripts": {
  "build": "react-scripts build",
  "start": "react-scripts start",
  // ...existing scripts...
}
```

### Server-Side Configuration

Update your server to use environment variables for configuration:

1. Ensure MongoDB connection is using the `MONGODB_URI` environment variable
2. Set the server to listen on `process.env.PORT || 5000`
3. Configure CORS to allow requests from your frontend domain:

```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));
```

## 2. Database: MongoDB Atlas

1. Create a free MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient)
3. Set up a database user with password authentication
4. Whitelist all IP addresses (0.0.0.0/0) for development or specific IPs for production
5. Get your connection string from Atlas: should look like `mongodb+srv://username:password@cluster0.mongodb.net/interpreter`

## 3. Backend: Render

Render provides a free tier for web services that's suitable for our Node.js backend.

1. Create an account at [https://render.com](https://render.com)
2. Click "New" and select "Web Service"
3. Connect to your GitHub repository
4. Configure the service:
   - **Name**: interpreter-api (or your preferred name)
   - **Root Directory**: server
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Environment Variables**:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `CLIENT_URL`: Your frontend Vercel URL (you'll add this later)
     - `MOCK_MODE`: false (or true if you want to use mock mode)
     - `NODE_ENV`: production
5. Click "Create Web Service"

⚠️ Note: Render's free tier will spin down after periods of inactivity, causing a delay on the first request. This is normal for free services.

## 4. Frontend: Vercel

Vercel is ideal for deploying React applications with minimal configuration.

1. Create an account at [https://vercel.com](https://vercel.com)
2. Install the Vercel CLI: `npm i -g vercel`
3. From the client directory, run: `vercel login`
4. Configure the frontend deployment:
   - Create a `vercel.json` in your client directory:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. Set up environment variables on Vercel:
   - Go to your project settings → Environment Variables
   - Add `REACT_APP_API_URL`: Your Render backend URL
   - Add `REACT_APP_MOCK_MODE`: false (or true for testing)
6. Deploy with: `vercel --prod`

## 5. Connecting Everything

After both services are deployed:

1. Go back to Render and update the `CLIENT_URL` environment variable with your Vercel frontend URL
2. Verify CORS is working by testing the application
3. If needed, update the frontend with the correct backend URL

## 6. Handling Limitations of Free Tiers

### Keeping the Backend Alive

Free tier services like Render often spin down after periods of inactivity. To minimize startup delays:

1. Set up a simple ping service using [UptimeRobot](https://uptimerobot.com/) (free tier)
2. Configure it to ping your backend URL every 5-10 minutes
3. Add a simple health endpoint to your server:

```javascript
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
```

### Using Mock Mode on Free Tier

If you don't want to use your OpenAI API credits during development:

1. Set `MOCK_MODE=true` in your Render environment variables
2. Set `REACT_APP_MOCK_MODE=true` in your Vercel environment variables

This allows you to demonstrate the application flow without incurring API costs.

## 7. Testing the Deployment

1. Visit your Vercel URL to access the application
2. Select a role (Doctor or Patient)
3. Test the recording functionality
4. Verify translations are working (either real or mock)
5. Check that the summary generation functions correctly

## 8. Troubleshooting Common Issues

### CORS Errors

If you see CORS errors in the console:

1. Verify the `CLIENT_URL` in your backend environment is correct
2. Check that your CORS configuration includes all necessary methods

### API Connection Issues

If the frontend cannot connect to your backend:

1. Ensure your `REACT_APP_API_URL` is set correctly without trailing slashes
2. Check that your backend is running (it may have spun down if using the free tier)
3. Try a manual request to `/health` endpoint to wake up the service

### MongoDB Connection Issues

If your server cannot connect to MongoDB:

1. Verify your MongoDB Atlas whitelist includes all necessary IPs
2. Check that your connection string is correctly formatted in the environment variables
3. Verify the database user has appropriate permissions

## Security Considerations

Even when using free services, maintain good security practices:

1. Never store API keys in client-side code
2. Set appropriate CORS restrictions for production
3. Consider rate limiting to prevent abuse of your API
4. Implement proper authentication if extending the application

## Future Enhancements

Free tiers are great for starting, but consider upgrading when:

1. You need more reliable uptime (no spin-downs)
2. You require more processing power for increased translation loads
3. You want to add user authentication and personalized data
4. You need higher rate limits for the OpenAI API calls
