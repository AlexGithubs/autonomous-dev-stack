#!/usr/bin/env node

/**
 * Professional Prompt Templates for Investor-Ready SaaS Applications
 * Generates high-quality Next.js + TypeScript + shadcn/ui code
 */

const COMPONENT_IMPORTS = `
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle2, Bell, Settings, Menu, Search, Plus, ArrowRight, Star, Users, TrendingUp, DollarSign, BarChart3, Calendar, Filter, Download, Edit, Trash2, Eye, ChevronDown, ChevronRight, Home, Dashboard, FileText, CreditCard, User, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
`;

const SAAS_LANDING_TEMPLATE = (spec) => `
You are an expert Next.js developer creating a professional SaaS landing page that looks like it cost $100k+ to build.

SPECIFICATION: ${spec}

Create a complete, production-ready landing page with:

REQUIRED FILES TO GENERATE:
1. pages/index.tsx - Main landing page
2. components/ui/button.tsx - shadcn/ui Button component
3. components/ui/card.tsx - shadcn/ui Card component
4. components/ui/input.tsx - shadcn/ui Input component
5. components/ui/badge.tsx - shadcn/ui Badge component
6. components/landing/hero-section.tsx - Hero component
7. components/landing/features-section.tsx - Features component
8. components/landing/pricing-section.tsx - Pricing component
9. components/landing/testimonials-section.tsx - Testimonials component
10. components/landing/cta-section.tsx - Call-to-action component
11. lib/utils.ts - Utility functions
12. types/index.ts - TypeScript interfaces
13. tailwind.config.js - Professional Tailwind configuration

DESIGN REQUIREMENTS:
- Modern gradient backgrounds (use gradients like "from-blue-600 via-purple-600 to-indigo-700")
- Professional typography scale (text-5xl, text-xl, text-lg with proper font-weights)
- Consistent spacing using Tailwind spacing scale (py-24, px-6, space-y-12)
- Interactive elements with hover states and transitions
- Mobile-first responsive design with proper breakpoints
- Professional color palette (slate, blue, purple, emerald for accents)
- Card-based layouts with subtle shadows and borders
- Professional iconography using Lucide React icons

COMPONENT QUALITY STANDARDS:
- Each component must be fully functional with proper TypeScript typing
- Include realistic placeholder content (not "Lorem ipsum")
- Add hover animations and micro-interactions
- Use proper semantic HTML for accessibility
- Include loading states and error handling where appropriate
- Professional styling that matches modern SaaS applications like Stripe, Vercel, Linear

HERO SECTION REQUIREMENTS:
- Large headline with gradient text effect
- Compelling subtitle describing the value proposition
- Two prominent CTAs (primary and secondary)
- Hero image or illustration placeholder
- Social proof elements (customer logos, metrics)
- Animated elements using Framer Motion

FEATURES SECTION REQUIREMENTS:
- Grid layout with feature cards
- Icons for each feature (use Lucide React)
- Clear headlines and descriptions
- Visual hierarchy with proper spacing
- Hover effects on feature cards

PRICING SECTION REQUIREMENTS:
- 3-tier pricing table with popular badge
- Feature comparison lists
- Annual/monthly toggle
- Professional styling with hover states
- Clear CTAs for each plan

TESTIMONIALS SECTION REQUIREMENTS:
- Customer testimonials with photos and company logos
- Star ratings display
- Carousel or grid layout
- Professional typography and spacing

RESPOND WITH VALID JSON IN THIS FORMAT:
{
  "files": [
    {
      "path": "pages/index.tsx",
      "content": "// Complete landing page component with all sections"
    },
    {
      "path": "components/ui/button.tsx", 
      "content": "// shadcn/ui Button component"
    }
    // ... continue for all 13 files
  ]
}

CRITICAL: Generate complete, production-ready code. No placeholders or TODOs. Every component must be fully implemented with professional styling and functionality.
`;

const SAAS_DASHBOARD_TEMPLATE = (spec) => `
You are an expert Next.js developer creating a professional SaaS dashboard that looks like Linear, Stripe, or Vercel quality.

SPECIFICATION: ${spec}

Create a complete, production-ready dashboard application with:

REQUIRED FILES TO GENERATE:
1. pages/dashboard.tsx - Main dashboard page
2. components/dashboard/sidebar.tsx - Collapsible sidebar navigation
3. components/dashboard/header.tsx - Top header with user menu
4. components/dashboard/stats-cards.tsx - Metrics overview cards
5. components/dashboard/data-table.tsx - Advanced data table
6. components/dashboard/chart-section.tsx - Charts and analytics
7. components/dashboard/recent-activity.tsx - Activity feed
8. components/ui/button.tsx - shadcn/ui Button
9. components/ui/card.tsx - shadcn/ui Card
10. components/ui/table.tsx - shadcn/ui Table
11. components/ui/avatar.tsx - shadcn/ui Avatar
12. components/ui/badge.tsx - shadcn/ui Badge
13. components/ui/sheet.tsx - shadcn/ui Sheet (for mobile menu)
14. components/ui/select.tsx - shadcn/ui Select
15. lib/utils.ts - Utility functions
16. types/dashboard.ts - Dashboard TypeScript interfaces
17. tailwind.config.js - Professional Tailwind config

DESIGN REQUIREMENTS:
- Clean, modern design with proper white space
- Consistent color palette (slate for text, blue for primary actions)
- Professional typography hierarchy
- Subtle shadows and borders for depth
- Responsive grid layouts that work on all devices
- Interactive elements with proper hover and focus states
- Loading skeleton states for better UX

SIDEBAR REQUIREMENTS:
- Collapsible sidebar with toggle button
- Navigation items with icons (Home, Dashboard, Analytics, Settings, etc.)
- User profile section at bottom
- Active state indicators
- Smooth animations for expand/collapse

HEADER REQUIREMENTS:
- Search functionality with keyboard shortcuts
- Notification bell with badge
- User avatar dropdown menu
- Breadcrumb navigation
- Mobile hamburger menu integration

STATS CARDS REQUIREMENTS:
- 4 key metrics cards in a responsive grid
- Each card shows: title, value, change percentage, trend icon
- Color-coded for positive/negative changes (green/red)
- Loading skeleton states
- Animated number counters

DATA TABLE REQUIREMENTS:
- Sortable columns with sort indicators
- Row selection with checkboxes
- Pagination controls
- Search/filter functionality
- Actions dropdown for each row
- Empty state handling
- Loading states

CHART SECTION REQUIREMENTS:
- Multiple chart types (line, bar, donut)
- Interactive legends and tooltips
- Responsive design that scales
- Date range picker for filtering
- Export functionality

RESPOND WITH VALID JSON IN THIS FORMAT:
{
  "files": [
    {
      "path": "pages/dashboard.tsx",
      "content": "// Complete dashboard page with all components"
    }
    // ... continue for all 17 files
  ]
}

CRITICAL: Generate complete, functional code with realistic data. No placeholders. Every component must be production-ready with proper TypeScript types and professional styling.
`;

const SAAS_APP_TEMPLATE = (spec) => `
You are an expert Next.js developer creating a complete SaaS application that looks and functions like a $100k+ professional product.

SPECIFICATION: ${spec}

Create a full-stack SaaS application with authentication, dashboard, and core features:

REQUIRED FILES TO GENERATE:
1. pages/index.tsx - Landing page
2. pages/dashboard.tsx - Main dashboard
3. pages/login.tsx - Authentication page
4. pages/signup.tsx - Registration page
5. pages/settings.tsx - User settings
6. pages/api/auth/login.ts - Login API endpoint
7. pages/api/auth/signup.ts - Registration API endpoint
8. pages/api/dashboard/stats.ts - Dashboard data API
9. components/layout/main-layout.tsx - Main app layout
10. components/layout/auth-layout.tsx - Auth pages layout
11. components/auth/login-form.tsx - Login form component
12. components/auth/signup-form.tsx - Registration form
13. components/dashboard/sidebar.tsx - Navigation sidebar
14. components/dashboard/header.tsx - Dashboard header
15. components/ui/* - Complete shadcn/ui component library (15+ components)
16. lib/auth.ts - Authentication utilities
17. lib/api.ts - API client utilities
18. lib/validations.ts - Zod validation schemas
19. types/auth.ts - Authentication types
20. types/dashboard.ts - Dashboard types
21. tailwind.config.js - Professional Tailwind configuration
22. middleware.ts - Next.js middleware for auth

DESIGN SYSTEM REQUIREMENTS:
- Consistent color palette: slate for neutrals, blue for primary, emerald for success, red for errors
- Typography scale: text-sm to text-4xl with proper line heights
- Spacing system: 4px base unit (space-1 to space-24)
- Border radius: rounded-lg for cards, rounded-md for inputs
- Shadow system: subtle shadows for depth (shadow-sm, shadow-md, shadow-lg)
- Professional animations: hover transitions, loading states, page transitions

AUTHENTICATION SYSTEM:
- Complete login/signup forms with validation
- Password strength indicators
- Email verification flow
- Forgot password functionality
- Protected route middleware
- Session management
- Proper error handling and feedback

DASHBOARD FEATURES:
- Modern sidebar navigation with icons
- Collapsible mobile menu
- User profile dropdown
- Stats overview with animated counters
- Data tables with sorting and filtering
- Charts and analytics visualization
- Settings panel for user preferences

API LAYER:
- RESTful API endpoints with proper HTTP status codes
- Input validation using Zod schemas
- Error handling with structured responses
- Authentication middleware
- Rate limiting considerations
- TypeScript interfaces for all data

RESPONSIVE DESIGN:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface elements
- Proper spacing and sizing on all devices
- Collapsible navigation for mobile

RESPOND WITH VALID JSON IN THIS FORMAT:
{
  "files": [
    {
      "path": "pages/index.tsx",
      "content": "// Complete landing page"
    },
    {
      "path": "pages/dashboard.tsx", 
      "content": "// Complete dashboard with all features"
    }
    // ... continue for all 22+ files
  ]
}

CRITICAL: Every file must be complete and production-ready. Generate real business logic, proper TypeScript types, professional styling, and functional components. No TODO comments or placeholders.
`;

// Prompt selection logic
function generatePrompt(spec, appType = 'saas-app') {
  const specSummary = spec.substring(0, 2000); // Increase spec length for better context
  
  switch (appType.toLowerCase()) {
    case 'landing':
    case 'landing-page':
      return SAAS_LANDING_TEMPLATE(specSummary);
    case 'dashboard':
      return SAAS_DASHBOARD_TEMPLATE(specSummary);
    case 'saas':
    case 'saas-app':
    case 'app':
    default:
      return SAAS_APP_TEMPLATE(specSummary);
  }
}

// Export for use in devin_run.sh
module.exports = { generatePrompt, COMPONENT_IMPORTS };

// CLI usage - check if this file is being run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const spec = args[0] || 'Build a professional SaaS application';
  const appType = args[1] || 'saas-app';
  
  console.log(generatePrompt(spec, appType));
}