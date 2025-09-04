# 🚀 WorldWeaver Development Setup

## Quick Start

To start the development environment with both Supabase and Next.js:

```bash
node start-dev.js
```

Or run manually:

```bash
# Start Supabase (required for database)
npx supabase@latest start

# Start Next.js development server
npm run dev
```

## Development URLs

- **Next.js App**: http://localhost:3001
- **Supabase Studio**: http://127.0.0.1:54323
- **Supabase API**: http://127.0.0.1:54321

## Troubleshooting

### "Error loading worlds" Issue

This happens when Supabase is not running. To fix:

1. Make sure Docker is installed and running
2. Start Supabase: `npx supabase@latest start`
3. Refresh the dashboard page

### Database Connection Issues

- Check if Supabase is running: `npx supabase@latest status`
- Restart Supabase: `npx supabase@latest stop && npx supabase@latest start`

## Project Status

✅ **Phase 1.1-1.4**: Foundation Complete  
✅ **Phase 2.1**: Worlds Management Complete  
✅ **Phase 2.2**: Card Types System Complete  
✅ **Dark Mode**: UI Theme Complete  
🔄 **Phase 2.3**: Next - Folders & Organization
