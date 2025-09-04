# WorldWeaver Development Build Order

## Phase 1: Foundation (Weeks 1-3)

### 1.1 Project Setup (Week 1) ✅ COMPLETED
- [x] Initialize Next.js 14+ with TypeScript, Tailwind CSS, ESLint
- [x] Set up Supabase project (Auth, Database, Storage, Realtime)
- [x] Configure environment variables and secrets
- [x] Set up basic folder structure (`/components`, `/pages`, `/lib`, `/types`)
- [x] Install core dependencies (Supabase client, Stripe, React Hook Form, etc.)

### 1.2 Database Schema (Week 1-2) ✅ COMPLETED
- [x] Create all Supabase tables per PRD schema
- [x] Set up Row Level Security (RLS) policies
- [x] Create database functions (`search_cards`, `get_world_summary`)
- [x] Seed development data (sample users, worlds, card types)
- [x] Test database operations with Supabase client

### 1.3 Authentication & User Management (Week 2) ✅ COMPLETED
- [x] Implement Supabase Auth (sign up, login, logout)
- [x] Create user profile management
- [x] Set up protected routes and middleware
- [x] Basic user dashboard layout

### 1.4 Core Types & Utilities (Week 2-3) ✅ COMPLETED
- [x] Define TypeScript interfaces for all entities
- [x] Create Supabase client utilities
- [x] Set up error handling and toast notifications
- [x] Create reusable UI components (buttons, inputs, modals)

## Phase 2: Core Entity Management (Weeks 4-6)

### 2.1 Worlds Management ✅ COMPLETE (Week 4)
- [x] World creation, editing, deletion
- [x] Worlds dashboard with grid/list view
- [x] World selection and navigation
- [x] Basic world settings page

### 2.2 Card Types System ✅ COMPLETE (Week 4-5)
- [x] Card type creation and editing
- [x] Field schema definition (all field types)
- [x] Type designer UI with drag-and-drop reordering
- [x] Field validation and default values

### 2.3 Folders & Organization (Week 5)
- [ ] Folder creation, nesting, and management
- [ ] Folder sidebar navigation
- [ ] Card assignment to folders
- [ ] Folder-based filtering

### 2.4 Cards Management (Week 5-6)
- [ ] Card creation with dynamic field rendering
- [ ] Card editing with field validation
- [ ] Card deletion and bulk operations
- [ ] Image upload and preview
- [ ] Auto-slug generation

## Phase 3: Core Features (Weeks 7-9)

### 3.1 Search & Filtering (Week 7)
- [ ] Full-text search implementation
- [ ] Filter by type, folder, tags, relationships
- [ ] Saved searches functionality
- [ ] Search results pagination

### 3.2 Relationships System (Week 7-8)
- [ ] Card linking UI with search
- [ ] Relationship creation, editing, deletion
- [ ] Bidirectional relationship display
- [ ] Relationship limits enforcement (10 per card)

### 3.3 Basic Exports (Week 8)
- [ ] JSON export functionality
- [ ] Markdown export with formatting
- [ ] Export scope selection (folders/types)
- [ ] Download file generation

## Phase 4: AI Integration (Weeks 10-12)

### 4.1 Edge Functions Setup (Week 10)
- [ ] Deploy Supabase Edge Functions
- [ ] Create `ai_generate_field` function
- [ ] Set up OpenRouter/OpenAI integration
- [ ] Error handling and retry logic

### 4.2 Single Field AI Generation (Week 10-11)
- [ ] AI assist panel in card editor
- [ ] Context assembly (world + linked cards)
- [ ] Generate/refine field content
- [ ] Token usage tracking

### 4.3 BYO API Keys (Week 11)
- [ ] API key encryption at rest
- [ ] User API key management UI
- [ ] Switch between platform/user keys
- [ ] Key validation and testing

### 4.4 Usage Metering (Week 11-12)
- [ ] Credit tracking system
- [ ] Usage events logging
- [ ] Usage display in UI
- [ ] Limit warnings and enforcement

## Phase 5: Subscriptions & Limits (Weeks 13-14)

### 5.1 Stripe Integration (Week 13)
- [ ] Stripe setup and webhook handling
- [ ] Plan configuration and pricing
- [ ] Subscription creation and management
- [ ] Invoice and billing history

### 5.2 Plan Enforcement (Week 13-14)
- [ ] Server-side limit enforcement
- [ ] UI limit indicators and warnings
- [ ] Plan upgrade/downgrade flows
- [ ] Usage-based restrictions

## Phase 6: Advanced AI Features (Weeks 15-17)

### 6.1 Image Generation (Week 15)
- [ ] Basic image generation for single cards
- [ ] Style template system (choice-only)
- [ ] Image storage and thumbnail generation
- [ ] Token image creation (256/512/1024px)

### 6.2 Batch Generation (Week 16)
- [ ] Batch job queue system
- [ ] `batch_generate_tokens` Edge Function
- [ ] Real-time progress updates
- [ ] Batch generation UI and queue management

### 6.3 Advanced Exports (Week 16-17)
- [ ] Token ZIP export functionality
- [ ] `build_export_zip` Edge Function
- [ ] Export history and status tracking
- [ ] Filename standardization

## Phase 7: Mobile & UX Polish (Weeks 18-19)

### 7.1 Mobile Optimization (Week 18)
- [ ] Mobile-first responsive design
- [ ] Touch-friendly interactions
- [ ] Bottom navigation bar
- [ ] Swipe gestures and mobile-specific UX

### 7.2 UX Improvements (Week 18-19)
- [ ] Loading states and skeletons
- [ ] Improved error handling
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements (WCAG 2.1 AA)

## Phase 8: MVP Testing & Launch Prep (Weeks 20-21)

### 8.1 Testing & QA (Week 20)
- [ ] End-to-end testing suite
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing

### 8.2 Documentation & Launch (Week 21)
- [ ] User documentation (quickstart, guides)
- [ ] API documentation
- [ ] Deployment to production
- [ ] Analytics and monitoring setup

## Key Decision Points & Dependencies

### Critical Path Dependencies:
1. **Database Schema** → All other features depend on this
2. **Auth System** → Required for all user-specific features
3. **Card Types** → Must exist before Cards can be created
4. **Cards System** → Required for Relationships and AI features
5. **AI Infrastructure** → Must be solid before batch features

### Parallel Development Opportunities:
- **UI Components** can be built alongside backend features
- **Search/Filtering** can be developed parallel to Relationships
- **Export systems** can be built while AI features are in development
- **Mobile optimization** can happen during feature development

### Risk Mitigation:
- **AI Integration** is complex - build simple first, then advanced
- **Batch Generation** has the highest technical risk - build last in AI phase
- **Payment Integration** should be tested early and often
- **Mobile UX** should be considered throughout, not just at the end

## Success Metrics for Each Phase:
- **Phase 1**: User can sign up, create world, create card type
- **Phase 2**: User can create cards, organize in folders
- **Phase 3**: User can search, link cards, export basic data
- **Phase 4**: User can generate AI content, track usage
- **Phase 5**: User can subscribe and see limits enforced
- **Phase 6**: User can batch generate images and export tokens
- **Phase 7**: Mobile user can use all core features comfortably
- **Phase 8**: Production-ready with full test coverage

This order ensures each phase builds solidly on the previous one, with minimal backtracking and rework.
