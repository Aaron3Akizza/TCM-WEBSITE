# Transform Youth Ministry (TYM) Website

A modern, professional website for Transform Youth Ministry built with React, Vite, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Vision

"We are a Christian ministry igniting the new creation into transformed leaders."

The TYM website communicates our commitment to:
- Christianity and spiritual growth
- Youth empowerment and leadership development
- Transformation and discipleship
- Excellence and professionalism
- Community and authentic connection

## 🛠 Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Database & Auth**: Supabase
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Linting**: Oxlint

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (free tier available at [supabase.com](https://supabase.com))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings under "API".

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to the "SQL Editor"
3. Create a new query
4. Copy the contents of `supabase/migrations/001_initial_schema.sql` and paste it
5. Click "Run"
6. (Optional) Run the seed data from `supabase/seed.sql` to populate sample events

### 4. Configure Authentication

1. In Supabase, go to "Authentication" > "Providers"
2. Enable "Email" provider
3. Under "URL Configuration", add your redirect URLs:
   - Local development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
tym-website/
│
├── src/
│   ├── components/
│   │   ├── layout/          # Navbar, Footer, Mobile Menu
│   │   ├── home/            # Homepage components (Hero, Identity Strip, etc)
│   │   ├── ui/              # Reusable UI components (Button, Card, Input, etc)
│   │   └── auth/            # Auth-related components
│   │
│   ├── pages/               # Page components for routing
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Events.tsx
│   │   ├── EventDetails.tsx
│   │   ├── Contact.tsx
│   │   ├── Media.tsx
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── Profile.tsx
│   │   └── NotFound.tsx
│   │
│   ├── lib/                 # Utilities and config
│   │   ├── supabase.ts      # Supabase client
│   │   ├── auth.ts          # Auth functions
│   │   └── utils.ts         # Utility functions
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   └── useEvents.ts     # Events hook
│   │
│   ├── types/               # TypeScript types
│   │   └── database.ts      # Database schema types
│   │
│   ├── data/                # Static data
│   │   └── navigation.ts    # Navigation links
│   │
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles with Tailwind
│
├── public/                  # Static assets
│   ├── images/
│   │   ├── hero/           # Hero images
│   │   ├── events/         # Event images
│   │   ├── ministry/       # Ministry images
│   │   └── placeholders/   # Placeholder images
│   ├── favicon.svg
│   └── logo.svg
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Database schema
│   └── seed.sql                     # Sample data
│
├── .env.example             # Environment variables template
├── .env                     # Environment variables (add your Supabase credentials)
├── .gitignore
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🎨 Design System

### Colors

- **Background (60%)**: `#F8F9FA` - Soft off-white
- **Structure (30%)**: `#1E293B` - Deep slate blue
- **Accent (10%)**: `#DC2626` - Crimson red

### Typography

- **Primary Font**: DM Sans (sans-serif)
- **Accent Font**: Cormorant Garamond (serif - for emphasis)

## 📝 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🗄 Database Schema

The application includes the following tables:

- **profiles** - User profiles and roles
- **events** - Ministry events
- **event_registrations** - User registrations for events
- **contact_messages** - Contact form submissions
- **newsletter_subscribers** - Newsletter subscriptions
- **media** - Media content (sermons, worship, teaching, etc)

All tables include appropriate indexes and Row-Level Security (RLS) policies.

## 🔐 Security Features

- Row Level Security (RLS) enabled on all tables
- Supabase Auth handles authentication
- No sensitive keys exposed in frontend code
- Email verification for new registrations
- Secure password management via Supabase

## 📱 Responsive Design

The website is fully responsive and works beautifully on:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

## ♿ Accessibility

Features include:
- Semantic HTML
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- ARIA labels where needed
- Good color contrast ratios

## 🚀 Deployment

### GitHub Pages

This repository includes a GitHub Actions workflow for GitHub Pages.

1. In the repository settings, add these Actions secrets under **Secrets and variables > Actions**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
2. Under **Settings > Pages**, set the source to **GitHub Actions**.
3. Push to the `master` branch or run the **Deploy to GitHub Pages** workflow manually.

The site will be available at `https://aaron3akizza.github.io/TYM-WEBSITE/`.

### Vercel or Other Hosts

Add the two `VITE_SUPABASE_*` environment variables in the host settings, run `npm run build`, and deploy the generated `dist` folder.

## 📖 Pages

- **Home** (`/`) - Main landing page with hero, identity strip, about, vision, pillars, events preview, CTA, newsletter
- **About** (`/about`) - About TYM page
- **Vision** (`/vision`) - Vision statement and pillars
- **What We Do** (`/what-we-do`) - Activities and programs
- **Events** (`/events`) - List of all upcoming events
- **Event Details** (`/events/:slug`) - Individual event page with registration
- **Media** (`/media`) - Sermons, worship, teaching, and video content
- **Get Involved** (`/get-involved`) - Ways to join, serve, lead, and partner
- **Contact** (`/contact`) - Contact form for inquiries
- **Sign In** (`/sign-in`) - User login
- **Sign Up** (`/sign-up`) - User registration
- **Profile** (`/profile`) - User profile page (authenticated only)

## 🔧 Customization

### Changing Colors

Edit `tailwind.config.js` to modify the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      'tym-bg': '#F8F9FA',
      'tym-slate': '#1E293B',
      'tym-crimson': '#DC2626',
    },
  },
},
```

### Updating Content

- Navigation links: `src/data/navigation.ts`
- Static text: Update individual page files in `src/pages/`
- Home page sections: Modify components in `src/components/home/`

### Adding Images

Place images in appropriate folders under `public/images/` and update component image paths.

## 🐛 Troubleshooting

### "Cannot find module" errors
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules: `rm -rf node_modules && npm install`

### Supabase connection issues
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Check that Supabase project is active
- Ensure CORS is properly configured in Supabase

### TypeScript errors
- Run `npm run build` to check for all errors
- Most IDE editors will show TypeScript errors inline

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)

## 📝 License

This project is built for Transform Youth Ministry.

## 🤝 Support

For questions or support, contact the development team.

---

**Built with ❤️ for Transform Youth Ministry**
