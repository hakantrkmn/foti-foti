# Foti Foti - Photo Upload App

A React-based photo upload application that allows users to take photos and upload them to Google Drive with user-based upload limits.

## Features

- 📸 **Photo Capture**: Take photos using device camera
- ☁️ **Google Drive Integration**: Upload photos to specific Google Drive folders
- 🔐 **User Authentication**: Google OAuth 2.0 authentication
- 📊 **Upload Limits**: User-based upload limits per folder
- 🔗 **QR Code Generation**: Generate QR codes for folder sharing
- 📱 **Responsive Design**: Works on mobile and desktop devices
- 🔒 **Security**: Hash-based URL validation and secure API access

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Google OAuth 2.0
- **Storage**: Google Drive API
- **Database**: Firebase Firestore
- **Analytics**: Vercel Analytics
- **Routing**: React Router
- **Mobile**: Capacitor (iOS & Android)
- **Camera**: Native Device Camera

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Google Drive API Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_API_KEY=your_google_api_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Vercel Analytics (Optional)
VITE_VERCEL_ANALYTICS_ID=your_analytics_id

# Base URL Configuration
VITE_BASE_URL=http://localhost:5173
```

## Installation

### Web Development
```bash
npm install
npm run dev
```

### Mobile Development

#### iOS
```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

#### Android
```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

Detaylı kurulum rehberleri için:
- [iOS Kurulum Rehberi](GOOGLE_DRIVE_SETUP.md)
- [Android Kurulum Rehberi](ANDROID_SETUP.md)

## Deployment

This project is configured for deployment on Vercel with analytics tracking enabled.

## License

MIT
