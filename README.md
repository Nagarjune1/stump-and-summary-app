
# Cricket Live Scoring App

A comprehensive cricket live scoring application built with React, TypeScript, and Supabase. This app allows real-time scoring, player management, match analytics, and detailed reporting for cricket matches.

## 🏏 Features

### Match Management
- Create and manage cricket matches
- Support for multiple formats (T20, ODI, Test)
- Live match status tracking
- Toss management with team selection
- Innings management with automatic transitions

### Live Scoring
- Real-time ball-by-ball scoring
- Quick scoring buttons (0, 1, 2, 3, 4, 6)
- Wicket tracking with detailed dismissal types
- Extras handling (Wides, No Balls, Byes, Leg Byes)
- Strike rotation management
- Over completion tracking

### Player Management
- Comprehensive player profiles with photos
- Team-wise player organization
- Player statistics tracking (batting & bowling)
- Career statistics calculation
- Player performance analytics

### Analytics & Reporting
- Match analytics with charts and graphs
- Run rate calculations
- Partnership tracking
- Fall of wickets visualization
- Player performance metrics
- Man of the Match/Series selection

### Export & Sharing
- Multiple export formats (PDF, PNG, JSON, CSV, TXT)
- Comprehensive match reports
- Social media sharing capabilities
- Print-friendly scorecards

## 🛠️ Tech Stack

### Frontend
- **React** (^18.3.1) - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **React Router DOM** (^6.26.2) - Client-side routing

### UI Components & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Pre-built component library
- **Radix UI** - Primitive components for accessibility
- **Lucide React** (^0.462.0) - Icon library
- **Class Variance Authority** (^0.7.1) - Component variants
- **Tailwind Merge** (^2.5.2) - Conditional CSS classes

### Backend & Database
- **Supabase** (^2.50.2) - Backend as a Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Row Level Security (RLS)
  - Storage for player photos

### State Management & Data Fetching
- **TanStack React Query** (^5.56.2) - Server state management
- **React Hook Form** (^7.53.0) - Form management
- **Hookform Resolvers** (^3.9.0) - Form validation

### Charts & Visualization
- **Recharts** (^2.12.7) - Data visualization library

### File Processing & Export
- **html2canvas** (^1.4.1) - HTML to canvas conversion
- **jsPDF** (^3.0.1) - PDF generation

### UI Enhancements
- **Next Themes** (^0.3.0) - Theme management
- **Sonner** (^1.5.0) - Toast notifications
- **React Day Picker** (^8.10.1) - Date picker
- **Input OTP** (^1.2.4) - OTP input component
- **Embla Carousel React** (^8.3.0) - Carousel component
- **React Resizable Panels** (^2.1.3) - Resizable layouts
- **Vaul** (^0.9.3) - Drawer component
- **CMDK** (^1.0.0) - Command palette

### Utilities & Validation
- **Date-fns** (^3.6.0) - Date utility library
- **Zod** (^3.23.8) - Schema validation
- **clsx** (^2.1.1) - Conditional CSS classes

## 📋 Database Schema

### Tables
- **teams** - Team information
- **players** - Player profiles and statistics
- **matches** - Match details and results
- **match_stats** - Player performance in matches
- **ball_by_ball** - Detailed ball-by-ball data
- **partnerships** - Batting partnerships
- **series** - Tournament/series information

### Key Features
- Row Level Security (RLS) policies
- Real-time data synchronization
- Foreign key relationships
- Optimized queries for performance

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

### Database Setup
1. Create a new Supabase project
2. Run the provided SQL migrations
3. Set up Row Level Security policies
4. Configure authentication (if needed)

## 📱 Usage

### Starting a Match
1. Create teams and add players
2. Create a new match with team selection
3. Complete the toss
4. Start live scoring

### Live Scoring
1. Select opening batsmen and bowler
2. Use quick scoring buttons for runs
3. Handle wickets with dismissal details
4. Manage extras and strike rotation
5. Complete overs and change bowlers

### Match Completion
1. Complete both innings
2. Select Man of the Match
3. View detailed scorecard
4. Export match report

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Basic live scoring functionality
- [x] Player and team management
- [x] Match creation and management
- [x] Real-time scoring updates
- [x] Basic reporting and exports

### Phase 2 (In Progress)
- [ ] Advanced analytics dashboard
- [ ] Performance comparison tools
- [ ] Tournament management
- [ ] Mobile app optimization
- [ ] Offline scoring capability

### Phase 3 (Planned)
- [ ] Video highlights integration
- [ ] Social media integration
- [ ] Multi-language support
- [ ] Advanced statistics (Wagon wheel, Heat maps)
- [ ] Commentary system
- [ ] Live streaming integration

### Phase 4 (Future)
- [ ] AI-powered insights
- [ ] Fantasy cricket integration
- [ ] Betting odds integration
- [ ] Professional league support
- [ ] Advanced user roles and permissions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

For support, please contact us through:
- GitHub Issues
- Discord Community
- Email support

## 🙏 Acknowledgments

- Shadcn UI for the beautiful component library
- Supabase for the excellent backend platform
- Recharts for data visualization
- All contributors and testers

---

Built with ❤️ for cricket enthusiasts worldwide!
