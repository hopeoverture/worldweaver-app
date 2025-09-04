# WorldWeaver

A comprehensive worldbuilding and campaign management application built with Next.js 15, Supabase, and TypeScript.

## 🌟 Features

- **Dynamic Card Types**: Create custom card types with flexible field schemas
- **Global Templates**: Access 11+ professional card type templates across 8 categories
- **Dark Mode UI**: Beautiful, consistent dark theme throughout the application
- **Real-time Collaboration**: Multi-user worlds with role-based access control
- **Rich Content**: Support for text, images, references, and structured data
- **Advanced Search**: Find content quickly across your entire world
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker Desktop (for local Supabase)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd worldweaver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Supabase locally**
   ```bash
   npx supabase start
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

- **Frontend**: Next.js 15.5.2 with Turbopack
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS with dark mode
- **Language**: TypeScript
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # Base UI components
│   ├── auth/             # Authentication components
│   ├── card-types/       # Card type management
│   └── worlds/           # World management
├── contexts/             # React contexts (auth, toast, etc.)
├── lib/                  # Utility libraries
│   ├── supabase/        # Supabase client and services
│   └── utils.ts         # General utilities
└── types/               # TypeScript type definitions

supabase/
├── migrations/          # Database schema migrations
├── config.toml         # Supabase configuration
└── seed.sql           # Initial data
```

## 🎨 Card Type Templates

WorldWeaver includes 11 professional templates across 8 categories:

### Characters (2 templates)
- **Character**: NPCs, protagonists, and other people
- **Deity/God**: Gods, goddesses, and divine beings

### Places (2 templates)
- **Location**: Cities, towns, buildings, and other places
- **Plane of Existence**: Different realms, dimensions, and planes

### Items (2 templates)
- **Magic Item**: Enchanted weapons, artifacts, and magical objects
- **Technology**: Sci-fi gadgets, steampunk devices, and advanced technology

### Organizations (1 template)
- **Organization**: Guilds, governments, factions, and other groups

### Events (1 template)
- **Event**: Historical events, festivals, wars, and other occurrences

### Concepts (1 template)
- **Culture/Society**: Cultures, societies, and civilizations

### Creatures (1 template)
- **Creature/Monster**: Beasts, monsters, and fantastical creatures

### Magic (1 template)
- **Spell/Magic**: Spells, magical phenomena, and supernatural effects

## 🗄️ Database Schema

The application uses a robust PostgreSQL schema with:

- **Row Level Security (RLS)** for data protection
- **User authentication** with Supabase Auth
- **Flexible JSONB schemas** for dynamic card types
- **Optimized indexes** for performance
- **Comprehensive migrations** for easy deployment

### Key Tables

- `profiles` - User profile information
- `worlds` - World/campaign containers
- `world_members` - Multi-user access control
- `card_types` - Dynamic card type definitions
- `card_type_templates` - Global template library
- `cards` - User-generated content
- `folders` - Content organization
- `card_links` - Relationships between cards

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Supabase Commands

- `npx supabase start` - Start local Supabase
- `npx supabase stop` - Stop local Supabase
- `npx supabase status` - Check service status
- `npx supabase db reset` - Reset local database
- `npx supabase migration new <name>` - Create new migration

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set up environment variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔐 Environment Variables

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Recent Changes

See [RECENT_CHANGES.md](./RECENT_CHANGES.md) for detailed information about recent updates and improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for worldbuilders everywhere**
