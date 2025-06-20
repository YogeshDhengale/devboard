# Devboard
Developer disscussion platform

## 🚀 Project Setup
Follow these steps to set up and run the project locally:

## Prerequisites

Make sure you have these installed:
- Node.js (v16 or higher)
- npm or yarn

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YogeshDhengale/aistudio.git
cd aistudio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Project

**For Development:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**For Production:**
```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm start` - Start production server
- `npm run lint` - Check code quality

## Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**Installation issues?**
```bash
rm -rf node_modules package-lock.json
npm install
```
