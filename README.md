```
 ██████╗███████╗██╗  ██╗    ███████╗████████╗██╗   ██╗██████╗ ██╗   ██╗     ██████╗ ██████╗  ██████╗ ██╗   ██╗██████╗ 
██╔════╝██╔════╝██║  ██║    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗╚██╗ ██╔╝    ██╔════╝ ██╔══██╗██╔═══██╗██║   ██║██╔══██╗
██║     █████╗  ███████║    ███████╗   ██║   ██║   ██║██║  ██║ ╚████╔╝     ██║  ███╗██████╔╝██║   ██║██║   ██║██████╔╝
██║     ██╔══╝  ██╔══██║    ╚════██║   ██║   ██║   ██║██║  ██║  ╚██╔╝      ██║   ██║██╔══██╗██║   ██║██║   ██║██╔═══╝ 
╚██████╗███████╗██║  ██║    ███████║   ██║   ╚██████╔╝██████╔╝   ██║       ╚██████╔╝██║  ██║╚██████╔╝╚██████╔╝██║     
 ╚═════╝╚══════╝╚═╝  ╚═╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝    ╚═╝        ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     
                                                                                                                        
 ████████╗██╗███╗   ███╗███████╗████████╗ █████╗ ██████╗ ██╗     ███████╗    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
 ╚══██╔══╝██║████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██║     ██╔════╝    ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
    ██║   ██║██╔████╔██║█████╗     ██║   ███████║██████╔╝██║     █████╗      ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
    ██║   ██║██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██╔══██╗██║     ██╔══╝      ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
    ██║   ██║██║ ╚═╝ ██║███████╗   ██║   ██║  ██║██████╔╝███████╗███████╗    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
    ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝    ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
                                                                                                                                
    ┌─── ACCESSING SECURE TERMINAL ───┐        ╔══════════════════════════════════════╗
    │  >>> AUTHORIZATION REQUIRED    │        ║  🔐 CLASSIFIED TRAINING PROTOCOL    ║
    │  >>> PIN: █████                │        ║  🎯 ETHICAL HACKING MASTERY         ║
    │  >>> ACCESS: GRANTED            │        ║  🚀 CYBERSECURITY EXCELLENCE        ║
    └─────────────────────────────────┘        ╚══════════════════════════════════════╝
```

# 🎮 CEH Study Group - Timetable System

> **A cyberpunk-themed scheduling system for Certified Ethical Hacker (CEH) study sessions**

## 🔥 Mission Overview

This Next.js application manages the timetable and facilitator rotation for a CEH study group with a futuristic cyberpunk interface. Features include:

- **🎯 Automated Session Management**: Tuesday/Thursday sessions with configurable meeting times
- **👤 Dynamic Facilitator Rotation**: Real-time operator reveals and rotation system  
- **🛡️ Secure Admin Panel**: PIN-protected administrative controls (5-digit authentication)
- **⚙️ Configurable Settings**: Admin-controlled meeting times and timezone settings
- **🎨 Cyberpunk UI/UX**: Matrix-style animations, glitch effects, and terminal aesthetics
- **📊 Real-time Updates**: Live session tracking and next meeting calculations

## 🚀 Tech Stack

- **Frontend**: Next.js 15.3.3, React 19.x, TypeScript
- **Styling**: Tailwind CSS + Custom Cyberpunk CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom PIN-based system with session storage
- **APIs**: RESTful endpoints for settings, facilitators, and timetable management

---

## 🛠️ Getting Started

### Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Environment Setup

Create a `.env` file with your database connection:

```bash
DATABASE_URL="postgresql://username:password@hostname:port/database"
```

### Database Setup

```bash
# Push the database schema
npx prisma db push

# Seed the database with initial data
node scripts/seed-settings.js
```

### Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
# or for coverage
npm run test:coverage
```

## 🎯 Key Features

### 🔐 Authentication System
- **Access Control**: 5-digit PIN authentication for admin access
- **Session Management**: Persistent login states with sessionStorage
- **Cyberpunk Theme**: Styled login interface with glitch effects

### ⚡ Dynamic Configuration
- **Meeting Times**: Configurable session times (default: 20:00 CAT)
- **Timezone Support**: Adjustable timezone settings
- **Real-time Updates**: Changes reflect immediately across the application

### 🎨 Cyberpunk Interface
- **Matrix Effects**: Animated background with falling code aesthetic
- **Terminal Style**: Monospace fonts and command-line inspired UI
- **Neon Colors**: Green/cyan color scheme with glitch animations
- **Responsive Design**: Works across all device sizes

### 📋 Admin Panel Features
- **Facilitator Management**: Add, edit, delete facilitators
- **Timetable Control**: Manage weekly topics and details
- **Settings Configuration**: Adjust meeting times and preferences
- **Real-time Preview**: See changes instantly

## 🎮 Application Structure

```
src/
├── app/
│   ├── admin/           # Admin panel with authentication
│   ├── auth/            # Authentication system
│   ├── api/             # RESTful API endpoints
│   │   ├── facilitator/ # Facilitator rotation logic
│   │   ├── settings/    # Configuration management
│   │   └── timetable/   # Schedule management
│   ├── globals.css      # Global styles
│   ├── cyberpunk.css    # Custom cyberpunk animations
│   └── page.tsx         # Main landing page
├── prisma/
│   └── schema.prisma    # Database schema
└── scripts/
    └── seed-settings.js # Database seeding
```

## 🎯 Usage

1. **Main Interface**: View current facilitator, next meeting time, and weekly topics
2. **Admin Access**: Enter 5-digit PIN to access administrative controls  
3. **Settings Management**: Configure meeting times and timezone from admin panel
4. **Facilitator Rotation**: System automatically rotates facilitators during session times
5. **Timetable Updates**: Add/edit weekly study topics and details

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🔧 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

**🎯 Built for CEH Study Excellence | 🔐 Secure by Design | 🎮 Cyberpunk Aesthetic**
#   T r i g g e r   d e p l o y m e n t  
 