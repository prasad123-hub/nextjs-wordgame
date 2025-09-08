# 🎮 Hangman Word Game

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker)
![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=for-the-badge&logo=amazon-aws)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Now-green?style=for-the-badge)](http://ec2-3-6-128-42.ap-south-1.compute.amazonaws.com:3000/sign-in)

_An interactive Hangman word guessing game with user authentication, statistics tracking, and leaderboards_

</div>

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture & Data Flow](#️-architecture--data-flow)
- [🚀 Features](#-features)
- [📦 Setup Instructions](#-setup-instructions)
- [🌐 Deployment](#-deployment)
- [📊 API Endpoints](#-api-endpoints)
- [🔧 Environment Variables](#-environment-variables)
- [📱 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)

---

## 🎯 Project Overview

**Hangman Word Game** is a modern, full-stack web application that brings the classic word-guessing game to life with a contemporary twist. Players can register, login, and enjoy an engaging word-guessing experience while tracking their performance through detailed statistics and competing on global leaderboards.

### 🎮 Game Mechanics

- **Random Word Selection**: Fetches random words from a MongoDB database
- **Progressive Difficulty**: Words range from 3-20 characters
- **Hint System**: Two hints per word to assist players
- **Real-time Feedback**: Instant visual feedback for correct/incorrect guesses
- **Game State Management**: Persistent game sessions with auto-save

### 📈 User Experience Features

- **JWT Authentication**: Secure login/signup with access & refresh tokens
- **Personal Statistics**: Comprehensive game analytics and performance metrics
- **Global Leaderboard**: Top 5 players ranked by overall performance
- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Built with TailwindCSS and ShadcnUI components

---

## 🛠️ Tech Stack

### Frontend

<div align="center">

| Technology                                                                                              | Version | Purpose                         |
| ------------------------------------------------------------------------------------------------------- | ------- | ------------------------------- |
| ![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)            | 15.5.2  | React framework with App Router |
| ![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)                   | 19.1.0  | UI library                      |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)       | 5.0     | Type safety                     |
| ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat-square&logo=tailwind-css) | 4.0     | Styling framework               |
| ![ShadcnUI](https://img.shields.io/badge/ShadcnUI-Components-000000?style=flat-square)                  | Latest  | UI component library            |
| ![Zustand](https://img.shields.io/badge/Zustand-5.0.8-FF6B6B?style=flat-square)                         | 5.0.8   | State management                |

</div>

### Backend

<div align="center">

| Technology                                                                                  | Version | Purpose             |
| ------------------------------------------------------------------------------------------- | ------- | ------------------- |
| ![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=flat-square&logo=node.js)  | 20.x    | Runtime environment |
| ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb) | Atlas   | Database            |
| ![Mongoose](https://img.shields.io/badge/Mongoose-8.18.0-47A248?style=flat-square)          | 8.18.0  | ODM for MongoDB     |
| ![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=flat-square)                     | 9.0.2   | Authentication      |
| ![Bcrypt](https://img.shields.io/badge/Bcrypt-6.0.0-FF6B6B?style=flat-square)               | 6.0.0   | Password hashing    |

</div>

### DevOps & Deployment

<div align="center">

| Technology                                                                                                        | Purpose          |
| ----------------------------------------------------------------------------------------------------------------- | ---------------- |
| ![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)                 | Containerization |
| ![AWS EC2](https://img.shields.io/badge/AWS-EC2-FF9900?style=flat-square&logo=amazon-aws)                         | Cloud hosting    |
| ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=flat-square&logo=github-actions) | CI/CD pipeline   |

</div>

---

### Data Flow Process

1. **User Authentication**
   - User signs up/logs in → JWT tokens generated
   - Access token (15min) + Refresh token (7days)
   - Tokens stored in HTTP-only cookies

2. **Game Initialization**
   - Authenticated user requests new word
   - Random word fetched from MongoDB
   - Game state created and stored

3. **Game Play**
   - User makes guesses → Real-time validation
   - Game state updated in database
   - Statistics calculated and stored

4. **Statistics & Leaderboard**
   - User stats aggregated from game history
   - Leaderboard calculated using complex scoring algorithm
   - Real-time updates on game completion

---

## 🚀 Features

### 🎮 Core Game Features

- ✅ **Random Word Generation** - Fetches words from database
- ✅ **Progressive Difficulty** - Words from 3-20 characters
- ✅ **Hint System** - Two hints per word
- ✅ **Real-time Validation** - Instant feedback
- ✅ **Game State Persistence** - Auto-save progress

### 👤 User Management

- ✅ **Secure Registration** - Email validation & password hashing
- ✅ **JWT Authentication** - Access & refresh token strategy
- ✅ **Session Management** - Automatic token refresh
- ✅ **Password Security** - Bcrypt hashing with salt

### 📊 Analytics & Social

- ✅ **Personal Statistics** - Win rate, average guesses, etc.
- ✅ **Game History** - Recent games tracking
- ✅ **Global Leaderboard** - Top 5 players ranking
- ✅ **Performance Metrics** - Detailed analytics

### 🎨 User Experience

- ✅ **Responsive Design** - Mobile & desktop optimized
- ✅ **Modern UI** - TailwindCSS + ShadcnUI
- ✅ **Dark/Light Theme** - Theme switching support
- ✅ **Loading States** - Smooth user experience
- ✅ **Error Handling** - Comprehensive error management

---

## 📦 Setup Instructions

### Prerequisites

- Node.js 20.x or higher
- pnpm package manager
- MongoDB Atlas account
- Docker (optional)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/nextjs-wordgame.git
   cd nextjs-wordgame
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Configuration**

   ```bash
   cp env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wordgame
   ACCESS_TOKEN_SECRET=your-access-token-secret
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   NEXTAUTH_SECRET=your-nextauth-secret
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Production Setup

1. **Build the application**

   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

### Docker Setup

1. **Build Docker image**

   ```bash
   docker build -t hangman-wordgame .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 --env-file .env.local hangman-wordgame
   ```

---

## 🌐 Deployment

### Live Application

🚀 **[Visit Live Demo](http://ec2-3-6-128-42.ap-south-1.compute.amazonaws.com:3000/sign-in)**

### Deployment Details

- **Platform**: AWS EC2 Instance
- **Region**: Asia Pacific (Mumbai) - ap-south-1
- **Instance Type**: t3.micro
- **Containerization**: Docker
- **Database**: MongoDB Atlas
- **Domain**: Custom domain attached (propagation in progress)

### Deployment Process

1. **Code Push** → GitHub Repository
2. **CI/CD Pipeline** → GitHub Actions
3. **Docker Build** → Container creation
4. **AWS Deployment** → EC2 instance
5. **Database Connection** → MongoDB Atlas

---

## 📊 API Endpoints

### Authentication Endpoints

| Method | Endpoint            | Description       |
| ------ | ------------------- | ----------------- |
| `POST` | `/api/auth/sign-up` | User registration |
| `POST` | `/api/auth/sign-in` | User login        |
| `POST` | `/api/auth/logout`  | User logout       |
| `POST` | `/api/auth/refresh` | Token refresh     |
| `GET`  | `/api/auth/me`      | Get current user  |

### Game Endpoints

| Method | Endpoint                | Description         |
| ------ | ----------------------- | ------------------- |
| `GET`  | `/api/game/words`       | Get random word     |
| `POST` | `/api/game/submit`      | Submit game data    |
| `GET`  | `/api/game/stats`       | Get user statistics |
| `GET`  | `/api/game/leaderboard` | Get top 5 players   |

---

## 🔧 Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wordgame

# JWT Secrets
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key

# Token Expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-key
```

---

## 📱 Screenshots

### 🔐 Authentication Pages

<div align="center">
  <img src="public/login-page.png" alt="Login Page" width="400"/>
  <p><em>Modern login interface with clean design</em></p>
  
  <img src="public/sign-up-page.png" alt="Sign Up Page" width="400"/>
  <p><em>User registration form with validation</em></p>
</div>

### 🎮 Game Interface

<div align="center">
  <img src="public/game-console.png" alt="Game Console" width="400"/>
  <p><em>Main game interface with word guessing</em></p>
  
  <img src="public/game-win-screen.png" alt="Game Win Screen" width="400"/>
  <p><em>Victory screen when player wins</em></p>
  
  <img src="public/game-lost-screeen.png" alt="Game Lost Screen" width="400"/>
  <p><em>Game over screen when player loses</em></p>
</div>

### 📊 Statistics & Leaderboard

<div align="center">
  <img src="public/user-stats-screen.png" alt="User Statistics" width="400"/>
  <p><em>Detailed user statistics and performance metrics</em></p>
  
  <img src="public/leaderboard-page.png" alt="Leaderboard" width="400"/>
  <p><em>Global leaderboard showing top 5 players</em></p>
</div>

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by Prasad Narkhedkar**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github)](https://github.com/prasad123-hub)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/prasadnarkhedkar)

</div>
