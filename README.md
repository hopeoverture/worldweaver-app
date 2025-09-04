# WorldWeaver

A modern, comprehensive worldbuilding and campaign management application built with Next.js 15, Supabase, and TypeScript. Create, organize, and explore your fictional worlds with professional-grade tools and templates.

## 🌟 Key Features

### 🎯 **Core Functionality**
- **Dynamic Card System**: Create custom card types with flexible field schemas (text, images, references, dates, and more)
- **Global Template Library**: 11+ professional templates across 8 categories to jumpstart your worldbuilding
- **Hierarchical Organization**: Organize content with folders and custom taxonomies
- **Advanced Relationships**: Link cards together to build complex world relationships
- **Full-Text Search**: Find any content instantly across your entire world

### 🎨 **User Experience**
- **Modern Dark UI**: Beautiful, consistent dark theme optimized for long writing sessions
- **Responsive Design**: Seamlessly works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clean, organized interface that gets out of your way
- **Real-time Updates**: See changes instantly as you and your team collaborate

### 👥 **Collaboration**
- **Multi-User Worlds**: Invite collaborators with role-based permissions (owner/editor/viewer)
- **Team Management**: Control who can view, edit, or manage your world content
- **Commenting System**: Discuss and provide feedback on specific cards and content

### 🔒 **Security & Reliability**
- **Row-Level Security**: Enterprise-grade security built into the database layer
- **User Authentication**: Secure sign-up/sign-in with email verification
- **Data Protection**: Your content is private by default with granular sharing controls
- **Automated Backups**: Never lose your work with built-in data persistence

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (20+ recommended)
- **Docker Desktop** (for local Supabase development)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hopeoverture/worldweaver-app.git
   cd worldweaver-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start local Supabase**
   ```bash
   npx supabase start
   ```
   *This will start PostgreSQL, Auth, and other Supabase services locally*

4. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```
   *Then edit `.env.local` with your local Supabase credentials (shown after `supabase start`)*

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) and start building your world!

### Development URLs
- **Application**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323 (database management)
- **API**: http://127.0.0.1:54321

## 🏗️ Technology Stack

### **Frontend**
- **Next.js 15.5.2** - React framework with App Router and Turbopack
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety throughout the application
- **Tailwind CSS v4** - Utility-first CSS with dark mode support

### **Backend & Database**
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)** - Database-level security policies
- **Authentication** - Built-in user management with email/password
- **Storage** - File uploads and image management

### **Development & Deployment**
- **Turbopack** - Ultra-fast build tool for development
- **ESLint & Prettier** - Code quality and formatting
- **Vercel** - Optimized deployment platform
- **Docker** - Local development environment

## 📁 Project Architecture

```
worldweaver-app/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── sign-in/       # Sign in page
│   │   │   └── sign-up/       # Registration page
│   │   ├── dashboard/         # Main application
│   │   │   ├── layout.tsx     # Dashboard layout
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── profile/       # User settings
│   │   │   └── worlds/        # World management
│   │   │       ├── page.tsx           # Worlds list
│   │   │       └── [worldId]/         # Individual world
│   │   │           ├── page.tsx       # World overview
│   │   │           ├── cards/         # Card management
│   │   │           └── card-types/    # Card type setup
│   │   ├── layout.tsx         # Root layout with dark mode
│   │   ├── page.tsx          # Landing page
│   │   └── globals.css       # Global styles
│   │
│   ├── components/           # Reusable React components
│   │   ├── ui/              # Base UI components (buttons, modals, etc.)
│   │   ├── auth/            # Authentication components
│   │   ├── worlds/          # World management components
│   │   ├── card-types/      # Card type creation & editing
│   │   ├── cards/           # Card CRUD components
│   │   ├── folders/         # Content organization
│   │   ├── layout/          # Layout and navigation
│   │   └── navigation/      # Navigation components
│   │
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx  # User authentication state
│   │   └── ToastContext.tsx # Notification system
│   │
│   ├── lib/                 # Utility libraries
│   │   ├── supabase/       # Database client & services
│   │   │   ├── client.ts   # Supabase client configuration
│   │   │   ├── server.ts   # Server-side client
│   │   │   └── service.ts  # Database operations
│   │   ├── utils.ts        # General utility functions
│   │   └── error-handling.ts # Error management
│   │
│   └── types/              # TypeScript type definitions
│       ├── entities.ts     # Core application entities
│       ├── database.ts     # Database schema types
│       └── supabase.ts     # Generated Supabase types
│
├── supabase/               # Database & backend
│   ├── migrations/         # Database schema evolution
│   ├── config.toml        # Supabase local configuration
│   └── seed.sql          # Initial data and templates
│
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🎨 Professional Templates

WorldWeaver includes **11 carefully crafted templates** across **8 categories** to accelerate your worldbuilding:

### 👥 **Characters** (2 templates)
- **Character**: Comprehensive character sheets for NPCs, protagonists, and supporting cast
  - *Physical description, personality traits, background, motivations, relationships*
- **Deity/God**: Divine beings and godlike entities
  - *Domains, worshippers, mythology, divine powers, religious practices*

### 🌍 **Places** (2 templates)  
- **Location**: Cities, towns, buildings, dungeons, and geographical features
  - *Government, population, notable features, threats, rulers, maps*
- **Plane of Existence**: Different realms, dimensions, and planes of reality
  - *Planar traits, inhabitants, access methods, unique properties*

### ⚔️ **Items** (2 templates)
- **Magic Item**: Enchanted weapons, artifacts, and magical objects
  - *Rarity, magical properties, history, activation methods, side effects*
- **Technology**: Sci-fi gadgets, steampunk devices, and advanced technology
  - *Function, power source, inventor, mass production, technological level*

### 🏛️ **Organizations** (1 template)
- **Organization**: Guilds, governments, factions, and groups
  - *Leadership, goals, membership, resources, allies, enemies*

### 📅 **Events** (1 template)
- **Event**: Historical events, festivals, wars, and occurrences
  - *Date, participants, consequences, historical significance*

### 🎭 **Concepts** (1 template)
- **Culture/Society**: Cultures, societies, and civilizations  
  - *Values, traditions, social structure, customs, beliefs*

### 🐉 **Creatures** (1 template)
- **Creature/Monster**: Beasts, monsters, and fantastical creatures
  - *Appearance, abilities, habitat, behavior, lore*

### ✨ **Magic** (1 template)
- **Spell/Magic**: Spells, magical phenomena, and supernatural effects
  - *Casting requirements, effects, duration, limitations, schools*

> 💡 **Pro Tip**: Templates are starting points! Customize fields, add new ones, or create entirely custom card types to match your world's unique needs.

## 🗄️ Database Architecture

WorldWeaver uses a sophisticated PostgreSQL schema designed for scalability, security, and flexibility:

### **Security Model**
- **Row Level Security (RLS)**: Every table has granular access policies
- **User Authentication**: Supabase Auth with email verification
- **Role-Based Access**: Owner → Editor → Viewer permission hierarchy
- **Data Isolation**: Users only access their own content and shared worlds

### **Core Tables**

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User accounts & preferences | Display name, avatar, subscription plan |
| `worlds` | World/campaign containers | Multi-user collaboration, visibility controls |
| `world_members` | Access control | Role-based permissions per world |
| `folders` | Hierarchical organization | Nested folder structure, color coding |
| `card_types` | Dynamic content schemas | JSONB field definitions, custom validation |
| `card_type_templates` | Global template library | Professional templates for quick setup |
| `cards` | User-generated content | Rich content with custom fields |
| `card_data` | Flexible field storage | Key-value pairs for dynamic schemas |
| `card_links` | Content relationships | Bidirectional links between cards |
| `comments` | Collaboration | Threaded discussions on cards |

### **Performance Features**
- **Optimized Indexes**: Fast queries on common access patterns
- **JSONB Storage**: Flexible schema evolution without migrations
- **Foreign Key Constraints**: Data integrity and referential consistency
- **Automatic Timestamps**: Created/updated tracking on all entities

## 🔧 Development

### **Available Scripts**

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run dev` | Start development server with Turbopack | Primary development command |
| `npm run build` | Build optimized production bundle | Before deployment |
| `npm run start` | Start production server | Production serving |
| `npm run lint` | Run ESLint code analysis | Code quality checks |
| `npm run lint:fix` | Automatically fix linting issues | Quick fixes |
| `npm run format` | Format code with Prettier | Code formatting |
| `npm run type-check` | Run TypeScript compiler | Type safety validation |

### **Supabase Management**

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npx supabase start` | Start local Supabase stack | Beginning development |
| `npx supabase stop` | Stop all Supabase services | End development session |
| `npx supabase status` | Check service status | Troubleshooting |
| `npx supabase db reset` | Reset local database | Fresh start with migrations |
| `npx supabase migration new <name>` | Create new migration | Schema changes |
| `npx supabase migration up` | Apply pending migrations | Update database |
| `npx supabase generate types typescript --local` | Generate TypeScript types | After schema changes |

### **Development Workflow**

1. **Start Development Environment**
   ```bash
   npx supabase start     # Start database and services
   npm run dev           # Start Next.js development server
   ```

2. **Make Changes**
   - Edit components in `src/components/`
   - Modify pages in `src/app/`
   - Update types in `src/types/`

3. **Database Changes**
   ```bash
   npx supabase migration new add_new_feature
   # Edit the migration file
   npx supabase migration up
   npm run supabase:generate-types
   ```

4. **Code Quality**
   ```bash
   npm run lint:fix      # Fix linting issues
   npm run format        # Format code
   npm run type-check    # Verify TypeScript
   ```

## 🚢 Deployment

### **Vercel (Recommended)**

WorldWeaver is optimized for Vercel deployment with zero configuration:

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Vercel automatically detects Next.js configuration

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Deploy**
   - Push to main branch for automatic deployment
   - Preview deployments for pull requests

### **Production Supabase Setup**

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your URL and anon key

2. **Run Migrations**
   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

3. **Configure Authentication**
   - Set up email templates
   - Configure redirect URLs
   - Enable required auth providers

### **Alternative Platforms**

WorldWeaver can be deployed to any platform supporting Next.js:

- **Netlify**: Configure build command as `npm run build`
- **Railway**: Automatic deployment with GitHub integration  
- **DigitalOcean App Platform**: Supports Next.js out of the box
- **AWS Amplify**: Full-stack deployment with CI/CD
- **Self-hosted**: Use `npm run build && npm run start`

## 🔐 Configuration

### **Required Environment Variables**

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### **Local Development Variables**

For local development with Supabase CLI:

```bash
# These are set automatically by `npx supabase start`
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Security Considerations**

- Never commit `.env.local` to version control
- Use different Supabase projects for development/staging/production
- Rotate API keys regularly in production
- Enable Row Level Security on all tables
- Configure proper CORS settings in Supabase

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### **Development Setup**

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/worldweaver-app.git
   cd worldweaver-app
   npm install
   ```

2. **Set Up Local Environment**
   ```bash
   npx supabase start
   cp .env.example .env.local
   npm run dev
   ```

### **Contribution Workflow**

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-amazing-feature
   ```

2. **Make Changes**
   - Write clear, documented code
   - Follow existing code style and patterns
   - Add tests for new functionality
   - Update TypeScript types as needed

3. **Test Your Changes**
   ```bash
   npm run lint          # Check code quality
   npm run type-check    # Verify TypeScript
   npm run build         # Test production build
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your amazing feature"
   git push origin feature/your-amazing-feature
   ```

5. **Open Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### **Code Style Guidelines**

- **TypeScript**: Use strict typing, avoid `any`
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS classes, consistent dark theme
- **Naming**: Descriptive names, camelCase for variables, PascalCase for components
- **Documentation**: JSDoc comments for complex functions

### **Areas for Contribution**

- 🐛 **Bug Fixes**: Check GitHub issues for bugs
- ✨ **New Features**: Propose ideas in discussions
- 📝 **Documentation**: Improve README, add examples
- 🎨 **UI/UX**: Enhance user experience and accessibility
- 🔧 **Performance**: Optimize database queries and rendering
- 🧪 **Testing**: Add unit and integration tests

## � Additional Resources

### **Documentation**
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### **Community & Support**
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Community support and ideas
- **Contributing Guide**: See above for contribution guidelines

### **Roadmap**
- **AI Integration**: Enhanced content generation capabilities
- **Mobile App**: Native iOS and Android applications
- **Advanced Templates**: More specialized templates and categories
- **Export Features**: PDF, Word, and other format exports
- **Team Features**: Enhanced collaboration tools
- **Plugin System**: Extensible architecture for custom features

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ **Commercial use** - Use in commercial projects
- ✅ **Modification** - Modify and distribute
- ✅ **Distribution** - Share with others
- ✅ **Private use** - Use for personal projects
- ❌ **Liability** - No warranty or liability
- ❌ **Warranty** - No warranty provided

## 🙏 Acknowledgments

WorldWeaver is built with amazing open-source technologies:

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Supabase](https://supabase.com/)** - Open source Firebase alternative  
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide](https://lucide.dev/)** - Beautiful & consistent icon pack
- **[Radix UI](https://www.radix-ui.com/)** - Low-level accessible components
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms library
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Special Thanks
- The **open-source community** for building incredible tools
- **Worldbuilders** everywhere who inspire creative storytelling
- **Early users** providing feedback and feature requests

---

<div align="center">

**Made with ❤️ for worldbuilders everywhere**

[🌟 Star on GitHub](https://github.com/hopeoverture/worldweaver-app) • [🐛 Report Bug](https://github.com/hopeoverture/worldweaver-app/issues) • [💡 Request Feature](https://github.com/hopeoverture/worldweaver-app/discussions)

</div>
