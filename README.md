
# Cricket Live Scoring App

A comprehensive cricket live scoring application built with React, TypeScript, and Supabase. This app allows real-time scoring, player management, match analytics, tournament management, and detailed reporting for cricket matches.

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

### Advanced Analytics (v1.2.0)
- Interactive performance dashboards with charts
- Player comparison tools across matches
- Trend analysis with time-series data
- Performance metrics visualization
- Data export capabilities
- AI-powered insights (beta)

### Multi-Language Support (NEW in v1.3.0)
- Support for English, Hindi, and Spanish
- Real-time language switching
- Cricket-specific terminology translation
- Cultural number formatting
- RTL (Right-to-Left) support preparation

### Social Media Integration (NEW in v1.3.0)
- Share match updates to Twitter, Facebook, WhatsApp
- Generate shareable scorecards and match images
- Custom sharing templates
- Social media analytics (coming soon)

### Enhanced Commentary System (NEW in v1.3.0)
- Live commentary feed with real-time updates
- Voice input for commentary
- AI-assisted commentary generation
- Professional commentary templates
- Audio playback support

### Professional Scoreboard (Enhanced in v1.3.0)
- Complete cricket scoreboard like Cricbuzz/ESPN
- Detailed batting and bowling statistics
- Fall of wickets tracking and visualization
- Partnership analysis and breakdown
- Over-by-over commentary
- Comprehensive match summary

### Offline Scoring (v1.2.0)
- Score matches without internet connection
- Automatic online/offline detection
- Smart data synchronization when reconnected
- Local data backup and export
- Seamless offline-to-online transitions

### Tournament Management
- Create and manage cricket tournaments
- Team registration with payment tracking
- Match fixtures and scheduling
- Officials and sponsor management
- Venue booking with cost management
- Prize money distribution tracking

### Player Management
- Comprehensive player profiles with photos
- Team-wise player organization
- Player statistics tracking (batting & bowling)
- Career statistics calculation
- Player performance analytics

### Analytics & Reporting
- Match analytics with charts and graphs
- Run rate calculations and visualizations
- Partnership tracking and analysis
- Fall of wickets visualization
- Player performance metrics
- Man of the Match/Series selection

### Export & Sharing
- Multiple export formats (PDF, PNG, JSON, CSV, TXT)
- Comprehensive match reports
- Social media sharing capabilities
- Print-friendly scorecards
- Offline data export for backup

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
- **matches** - Match details and results with toss information
- **match_stats** - Player performance in matches
- **ball_by_ball** - Detailed ball-by-ball data
- **partnerships** - Batting partnerships
- **series** - Tournament/series information
- **tournaments** - Tournament management
- **venues** - Venue information and facilities
- **tournament_teams** - Team registrations
- **tournament_officials** - Officials management
- **tournament_sponsors** - Sponsor management
- **app_settings** - Application configuration

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

### Multi-Language Support (NEW)
1. Select language from settings
2. Switch between English, Hindi, and Spanish
3. All cricket terminology is translated
4. Number formatting follows cultural preferences

### Social Media Sharing (NEW)
1. Create shareable content from match results
2. Generate professional scorecards as images
3. Share directly to Twitter, Facebook, WhatsApp
4. Use pre-built templates for quick sharing

### Commentary System (NEW)
1. Add live commentary during matches
2. Use voice input for hands-free commentary
3. AI-assisted commentary generation
4. Access professional commentary templates

### Offline Scoring
1. App automatically detects connectivity
2. Continue scoring when offline
3. Data saved locally and synced when online
4. Export offline data for backup

### Advanced Analytics
1. Access analytics from the main dashboard
2. Filter by matches, players, or date ranges
3. View interactive charts and performance metrics
4. Export analytics data in multiple formats

### Match Completion
1. Complete both innings
2. Select Man of the Match
3. View detailed scorecard
4. Export match report

## 🎯 Roadmap

### Phase 1 - Core Features ✅
- [x] Basic live scoring functionality
- [x] Player and team management
- [x] Match creation and management
- [x] Real-time scoring updates
- [x] Basic reporting and exports

### Phase 2 - Enhanced Analytics ✅ (v1.2.0)
- [x] Advanced analytics dashboard
- [x] Performance comparison tools
- [x] Tournament management
- [x] Mobile app optimization
- [x] Offline scoring capability

### Phase 3 - Advanced Features ✅ (v1.3.0)
- [x] Multi-language support
- [x] Social media integration
- [x] Advanced statistics tracking
- [x] Enhanced commentary system
- [x] Professional scoreboard features

### Phase 4 - AI & Professional (In Progress)
- [ ] AI-powered match predictions
- [ ] Advanced player analytics with ML
- [ ] Video highlights integration
- [ ] Professional league support
- [ ] Advanced user roles and permissions
- [ ] API for third-party integrations

### Phase 5 - Enterprise & Cloud (Future)
- [ ] Multi-tenant architecture
- [ ] Advanced reporting & business intelligence
- [ ] Custom branding & white-labeling
- [ ] Enterprise security features
- [ ] Data import/export tools
- [ ] Performance optimization at scale

## 📦 Release Notes

### v1.3.0 (January 6, 2025) - Multi-Language & Social Integration
**New Features:**
- Multi-Language Support with English, Hindi, and Spanish
- Social Media Integration for Twitter, Facebook, and WhatsApp
- Advanced Statistics Dashboard with AI-powered insights
- Enhanced Commentary System with voice input
- Professional Scoreboard with complete match details
- Improved wicket tracking and dismissal features

**Improvements:**
- Better language localization for cricket terminology
- Enhanced social sharing capabilities with custom templates
- Improved mobile responsiveness and user experience
- Better data visualization and analytics

**Bug Fixes:**
- Fixed wicket dismissal tracking and display issues
- Resolved scoreboard layout problems on mobile devices
- Improved data synchronization for offline scoring
- Fixed export functionality for match reports

### v1.2.0 (January 5, 2025) - Advanced Analytics & Offline Scoring
**New Features:**
- Advanced Analytics Dashboard with interactive charts
- Offline Scoring Mode with automatic synchronization
- Performance Comparison Tools for detailed player analysis
- Enhanced Mobile Experience with improved responsive design
- Release Notes tracking system

**Improvements:**
- Better toss management with streamlined UI
- Enhanced tournament management system
- Improved error handling and user feedback
- Optimized database queries for better performance

**Bug Fixes:**
- Fixed toss completion errors
- Resolved database column mapping issues
- Improved responsive layout on mobile devices

### v1.1.0 (December 28, 2024) - Tournament Management
- Tournament creation and management system
- Venue management with facilities tracking
- Enhanced documentation and project structure

### v1.0.0 (December 15, 2024) - Initial Release
- Core cricket scoring functionality
- Player and team management
- Basic analytics and reporting
- Multi-format export capabilities

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

**Current Version: 1.3.0** | **Last Updated: January 6, 2025**
