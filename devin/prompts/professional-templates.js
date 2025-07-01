#!/usr/bin/env node

/**
 * Professional SaaS Application Templates
 * Generates investor-ready applications with $100k+ quality
 */

// Enhanced landing page template with multiple variants
const LANDING_PAGE_TEMPLATE = (spec, variant = 'startup') => {
  const variants = {
    startup: {
      theme: 'modern gradient with bold CTAs',
      hero: 'Bold headline with animated gradient background and feature highlights',
      features: 'Three-column feature grid with icons and hover animations',
      pricing: 'Simple 3-tier pricing with most popular badge',
      testimonials: 'Customer logos and single testimonial highlight'
    },
    enterprise: {
      theme: 'professional with trust indicators',
      hero: 'Clean headline with security badges and enterprise testimonials',
      features: 'Feature comparison table with detailed benefits',
      pricing: 'Contact sales focus with ROI calculator',
      testimonials: 'Fortune 500 logos and detailed case studies'
    },
    creative: {
      theme: 'artistic with interactive elements',
      hero: 'Creative hero with video background and interactive demo',
      features: 'Masonry layout with visual examples and micro-interactions',
      pricing: 'Flexible pricing with usage sliders',
      testimonials: 'Creative portfolio showcase and designer testimonials'
    }
  };

  const selectedVariant = variants[variant] || variants.startup;

  return `You are an expert Next.js developer creating a professional SaaS landing page that looks and functions like a $100k+ application.

SPECIFICATION: ${spec}

DESIGN THEME: ${selectedVariant.theme}

Create a complete landing page with the following structure:

## REQUIRED FILES TO GENERATE:

### 1. pages/index.tsx - Professional Landing Page
Generate a stunning landing page with these sections:
- **Header/Navigation**: Logo, navigation links, CTA button
- **Hero Section**: ${selectedVariant.hero}
- **Features Section**: ${selectedVariant.features}
- **Pricing Section**: ${selectedVariant.pricing}
- **Testimonials**: ${selectedVariant.testimonials}
- **Footer**: Links, social media, legal pages

### 2. components/ui/button.tsx - Professional Button Component
\`\`\`typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
\`\`\`

### 3. components/ui/card.tsx - Professional Card Components
\`\`\`typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
\`\`\`

### 4. components/ui/input.tsx - Professional Input Component
\`\`\`typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
\`\`\`

### 5. lib/utils.ts - Utility Functions
\`\`\`typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
\`\`\`

### 6. pages/api/newsletter.ts - Newsletter Subscription API
\`\`\`typescript
import type { NextApiRequest, NextApiResponse } from 'next';

interface NewsletterRequest {
  email: string;
  name?: string;
}

interface NewsletterResponse {
  success: boolean;
  message: string;
  subscriberId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewsletterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const { email, name }: NewsletterRequest = req.body;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email address is required'
    });
  }

  try {
    // Simulate newsletter subscription (replace with actual service)
    const subscriberId = \`sub_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    
    // Log subscription (replace with actual logging service)
    console.log('Newsletter subscription:', { email, name, subscriberId, timestamp: new Date().toISOString() });

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      subscriberId
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.'
    });
  }
}
\`\`\`

### 7. pages/api/contact.ts - Contact Form API
\`\`\`typescript
import type { NextApiRequest, NextApiResponse } from 'next';

interface ContactRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const { name, email, company, message }: ContactRequest = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email address is required'
    });
  }

  try {
    // Generate ticket ID
    const ticketId = \`ticket_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    
    // Log contact form submission (replace with actual service)
    console.log('Contact form submission:', {
      ticketId,
      name,
      email,
      company,
      message: message.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      ticketId
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
}
\`\`\`

## DESIGN REQUIREMENTS:

### Visual Design
- **Color Scheme**: Use professional gradients (blue-purple for startup, gray-blue for enterprise, creative colors for creative)
- **Typography**: Clear hierarchy with modern fonts
- **Spacing**: Consistent padding and margins using Tailwind spacing scale
- **Shadows**: Subtle shadows for depth and professionalism
- **Animations**: Smooth transitions and hover effects using Framer Motion

### Interactive Elements
- **Buttons**: Multiple variants with hover states and loading indicators
- **Forms**: Proper validation with error states and success messages
- **Navigation**: Smooth scroll to sections with active state indicators
- **Cards**: Hover effects with subtle transforms and shadow changes

### Responsive Design
- **Mobile First**: Optimized for 375px minimum width
- **Tablet**: Responsive layout adjustments at 768px
- **Desktop**: Full experience at 1024px+ with proper spacing
- **Large Screens**: Maximum content width with centered layout

### Performance Optimizations
- **Image Optimization**: Next.js Image component with proper sizing
- **Code Splitting**: Dynamic imports for non-critical components
- **Font Loading**: Optimized font loading with fallbacks
- **Bundle Size**: Keep initial JavaScript under 100KB

### Accessibility Features
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Minimum 4.5:1 contrast ratio
- **Focus Indicators**: Clear focus states for all interactive elements

### SEO Optimization
- **Meta Tags**: Proper title, description, and Open Graph tags
- **Structured Data**: JSON-LD schema for better search results
- **Performance**: Core Web Vitals optimization
- **Mobile Friendly**: Mobile-first responsive design

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "files": [
    {
      "path": "pages/index.tsx",
      "content": "[Complete landing page component with all sections]"
    },
    {
      "path": "components/ui/button.tsx", 
      "content": "[Professional button component with variants]"
    },
    {
      "path": "components/ui/card.tsx",
      "content": "[Professional card components]"
    },
    {
      "path": "components/ui/input.tsx",
      "content": "[Professional input component]"
    },
    {
      "path": "lib/utils.ts",
      "content": "[Utility functions for className merging]"
    },
    {
      "path": "pages/api/newsletter.ts",
      "content": "[Newsletter subscription API endpoint]"
    },
    {
      "path": "pages/api/contact.ts",
      "content": "[Contact form API endpoint]"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Use TypeScript throughout with proper interfaces
- Implement all shadcn/ui components with proper styling
- Include Framer Motion animations for smooth interactions
- Add proper form validation and error handling
- Ensure mobile-responsive design with Tailwind CSS
- Include accessibility features (ARIA labels, keyboard navigation)
- Add proper SEO meta tags and structured data
- Implement loading states and error boundaries
- Use Next.js best practices (Image optimization, dynamic imports)
- Create professional-grade code that could power a $100k+ SaaS application

The landing page should be visually stunning, highly functional, and ready for investor presentations.`;
};

// Enhanced dashboard template for complex applications
const DASHBOARD_TEMPLATE = (spec) => `You are an expert Next.js developer creating a professional SaaS dashboard that looks and functions like a $100k+ application.

SPECIFICATION: ${spec}

Create a complete dashboard application with modern design and advanced functionality:

## REQUIRED FILES TO GENERATE:

### 1. pages/dashboard.tsx - Main Dashboard Layout
Generate a sophisticated dashboard with:
- **Sidebar Navigation**: Collapsible sidebar with icons and active states
- **Top Navigation**: User profile, notifications, search, breadcrumbs
- **Main Content Area**: Widget grid with responsive layout
- **Stats Cards**: Key metrics with trend indicators and charts
- **Data Tables**: Sortable, filterable tables with pagination
- **Charts**: Interactive charts using Chart.js or Recharts
- **Quick Actions**: Floating action button with menu

### 2. components/dashboard/sidebar.tsx - Professional Sidebar
### 3. components/dashboard/header.tsx - Dashboard Header
### 4. components/dashboard/stats-card.tsx - Metrics Cards
### 5. components/dashboard/data-table.tsx - Advanced Data Table
### 6. components/dashboard/chart.tsx - Interactive Charts
### 7. pages/api/dashboard/stats.ts - Dashboard Statistics API
### 8. pages/api/dashboard/data.ts - Dashboard Data API

[Continue with detailed dashboard specifications...]

RESPOND ONLY WITH VALID JSON with all required files and professional implementations.`;

// Enhanced SaaS application template for complex applications
const SAAS_APP_TEMPLATE = (spec) => `You are an expert Next.js developer creating a complete SaaS application that looks and functions like a $100k+ professional product.

SPECIFICATION: ${spec}

Create a full-stack SaaS application with authentication, dashboard, and core features:

## REQUIRED FILES TO GENERATE:

### Core Application Structure
1. **pages/index.tsx** - Professional landing page
2. **pages/dashboard.tsx** - Main application dashboard
3. **pages/login.tsx** - Authentication page with social login
4. **pages/signup.tsx** - User registration with email verification
5. **pages/settings.tsx** - User settings and preferences
6. **pages/billing.tsx** - Subscription management and billing
7. **pages/profile.tsx** - User profile management

### Authentication System
8. **pages/api/auth/[...nextauth].ts** - NextAuth configuration
9. **pages/api/auth/signup.ts** - User registration endpoint
10. **pages/api/auth/verify.ts** - Email verification endpoint

### Core API Endpoints
11. **pages/api/user/profile.ts** - User profile management
12. **pages/api/user/settings.ts** - User settings
13. **pages/api/subscription/manage.ts** - Subscription management
14. **pages/api/dashboard/stats.ts** - Dashboard statistics

### Professional Components
15. **components/auth/login-form.tsx** - Professional login form
16. **components/auth/signup-form.tsx** - Registration form with validation
17. **components/dashboard/sidebar.tsx** - Dashboard navigation
18. **components/dashboard/header.tsx** - Application header
19. **components/dashboard/stats-grid.tsx** - Metrics dashboard
20. **components/ui/button.tsx** - Professional button component
21. **components/ui/input.tsx** - Form input component
22. **components/ui/card.tsx** - Card component system

### Utility Files
23. **lib/auth.ts** - Authentication utilities
24. **lib/utils.ts** - General utilities
25. **lib/validations.ts** - Form validation schemas

[Continue with detailed SaaS application specifications...]

RESPOND ONLY WITH VALID JSON with all 25+ files for a complete professional SaaS application.`;

// Template selector function
function getTemplate(spec, appType, variant = 'startup') {
  switch (appType) {
    case 'landing':
      return LANDING_PAGE_TEMPLATE(spec, variant);
    case 'dashboard':
      return DASHBOARD_TEMPLATE(spec);
    case 'saas-app':
    default:
      return SAAS_APP_TEMPLATE(spec);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: professional-templates.js "<spec>" "<app-type>" [variant]');
    console.error('App types: landing, dashboard, saas-app');
    console.error('Variants (for landing): startup, enterprise, creative');
    process.exit(1);
  }
  
  const [spec, appType, variant] = args;
  const template = getTemplate(spec, appType, variant);
  console.log(template);
}

module.exports = { getTemplate, LANDING_PAGE_TEMPLATE, DASHBOARD_TEMPLATE, SAAS_APP_TEMPLATE };