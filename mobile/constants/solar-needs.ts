import { MaterialIcons } from '@expo/vector-icons';

export type SolarScreenField = {
  helper?: string;
  label: string;
  multiline?: boolean;
  placeholder: string;
  prefix?: string;
};

export type SolarScreenMetric = {
  label: string;
  value: string;
};

export type SolarScreenPanel = {
  bullets?: string[];
  description: string;
  footer?: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
};

export type SolarTimelineStep = {
  active?: boolean;
  detail: string;
  title: string;
};

export type SolarScreenConfig = {
  ctaLabel?: string;
  fields?: SolarScreenField[];
  group: 'Client App' | 'Staff App' | 'Admin Panel' | 'Landing Page';
  metrics: SolarScreenMetric[];
  panels: SolarScreenPanel[];
  screenName: string;
  slug: string;
  spotlight: {
    caption: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    value: string;
  };
  subtitle: string;
  timeline?: SolarTimelineStep[];
  title: string;
};

export const solarNeedsScreens: SolarScreenConfig[] = [
  {
    slug: 'client-login-register',
    group: 'Client App',
    screenName: 'Login / Register',
    title: 'Client Login and Registration',
    subtitle: 'Onboard solar buyers with quick mobile access, profile setup, and OTP-assisted recovery.',
    spotlight: {
      label: 'Authentication',
      value: 'OTP + Password',
      caption: 'Mobile login, profile setup, and secure password recovery for every client.',
      icon: 'lock-outline',
    },
    metrics: [
      { label: 'Primary Method', value: 'Mobile Number' },
      { label: 'Recovery', value: 'OTP Reset' },
      { label: 'Profile Setup', value: 'Enabled' },
    ],
    fields: [
      { label: 'Mobile Number', prefix: '+91', placeholder: 'Enter registered number' },
      { label: 'Password', placeholder: 'Enter your password' },
      { label: 'Full Name', placeholder: 'For new user registration' },
      { label: 'Address', placeholder: 'Primary installation location', multiline: true },
    ],
    panels: [
      {
        title: 'Secure Sign-In',
        description: 'Supports returning users with saved profile preferences and device-aware sessions.',
        icon: 'verified-user',
        bullets: ['Password login', 'Remembered profile', 'Role-safe authentication'],
      },
      {
        title: 'New User Flow',
        description: 'Collect essential account information with minimal friction and immediate onboarding.',
        icon: 'person-add-alt-1',
        bullets: ['Profile basics', 'Contact verification', 'Address capture'],
      },
      {
        title: 'Recovery Support',
        description: 'Forgot-password flow uses OTP verification before password reset.',
        icon: 'password',
        footer: 'Ideal for field users with limited access to email.',
      },
    ],
    ctaLabel: 'Continue to Dashboard',
  },
  {
    slug: 'client-dashboard',
    group: 'Client App',
    screenName: 'Dashboard',
    title: 'Client Solar Dashboard',
    subtitle: 'Bring savings, active orders, notifications, and quick inquiry actions into one glanceable home screen.',
    spotlight: {
      label: 'Estimated Savings',
      value: '₹1,18,400',
      caption: 'Recommended system performance and yearly bill savings based on recent usage.',
      icon: 'solar-power',
    },
    metrics: [
      { label: 'Active Orders', value: '2' },
      { label: 'Unread Alerts', value: '5' },
      { label: 'System Match', value: '6.5 kW' },
    ],
    panels: [
      {
        title: 'Recommended Products',
        description: 'Show smart package suggestions based on the uploaded electricity bill and home type.',
        icon: 'tips-and-updates',
      },
      {
        title: 'Installation Tracker',
        description: 'Expose the current stage, upcoming visit dates, and required approvals.',
        icon: 'home-repair-service',
      },
      {
        title: 'Quick Inquiry FAB',
        description: 'Floating action button launches a fast inquiry flow from anywhere on the dashboard.',
        icon: 'add-comment',
      },
    ],
    timeline: [
      { title: 'Inquiry Raised', detail: 'Initial requirement captured', active: true },
      { title: 'Quotation Shared', detail: 'Awaiting your review', active: true },
      { title: 'Installation Scheduled', detail: 'Visit to be confirmed' },
    ],
    ctaLabel: 'View Orders',
  },
  {
    slug: 'client-product-catalog',
    group: 'Client App',
    screenName: 'Product Catalog',
    title: 'Client Product Catalog',
    subtitle: 'Browse panels, inverters, batteries, and complete packages with clean filtering and price context.',
    spotlight: {
      label: 'Catalog Range',
      value: '4 Categories',
      caption: 'Solar panels, inverters, batteries, and bundled installation packages.',
      icon: 'inventory-2',
    },
    metrics: [
      { label: 'Panels', value: '32 SKUs' },
      { label: 'Batteries', value: '12 SKUs' },
      { label: 'Packages', value: '9 Plans' },
    ],
    panels: [
      {
        title: 'Visual Product Cards',
        description: 'Large media-first cards highlight images, capacity, warranty, and estimated price.',
        icon: 'photo-library',
      },
      {
        title: 'Category Filters',
        description: 'Users can refine by capacity, product type, and compatibility.',
        icon: 'tune',
      },
      {
        title: 'Interest Funnel',
        description: 'Every card routes to detailed specs and an immediate inquiry CTA.',
        icon: 'north-east',
      },
    ],
    ctaLabel: 'Open Product Details',
  },
  {
    slug: 'client-product-detail',
    group: 'Client App',
    screenName: 'Product Detail',
    title: 'Client Product Detail',
    subtitle: 'Let buyers understand specs, expected generation, warranty, and the next action without overwhelm.',
    spotlight: {
      label: 'Featured Product',
      value: '450W Mono Panel',
      caption: 'Detailed technical specifications paired with installation relevance and pricing clarity.',
      icon: 'bolt',
    },
    metrics: [
      { label: 'Warranty', value: '25 Years' },
      { label: 'Output', value: '450W' },
      { label: 'Price Band', value: '₹14k-₹17k' },
    ],
    panels: [
      {
        title: 'Spec Breakdown',
        description: 'Explain power output, dimensions, compatibility, and warranty in a readable summary.',
        icon: 'dataset',
      },
      {
        title: 'Gallery and Description',
        description: 'Use product images, installation examples, and short performance copy to build confidence.',
        icon: 'image',
      },
      {
        title: 'Interested CTA',
        description: 'The “I’m Interested” action should move the user directly into the inquiry form.',
        icon: 'campaign',
      },
    ],
    ctaLabel: 'I’m Interested',
  },
  {
    slug: 'client-inquiry-form',
    group: 'Client App',
    screenName: 'Inquiry Form',
    title: 'Client Inquiry and Lead Form',
    subtitle: 'Capture usage, roof conditions, location, and supporting documents in one guided submission flow.',
    spotlight: {
      label: 'Lead Creation',
      value: 'High Intent',
      caption: 'Collect enough operational detail for staff to estimate load, schedule surveys, and quote fast.',
      icon: 'edit-note',
    },
    metrics: [
      { label: 'Bill Upload', value: 'Required' },
      { label: 'Roof Photos', value: 'Optional' },
      { label: 'Load Estimate', value: 'Included' },
    ],
    fields: [
      { label: 'Monthly Electricity Bill', placeholder: '₹ 4,500 average monthly bill' },
      { label: 'Required Load (kW)', placeholder: 'Estimated system size needed' },
      { label: 'Roof Type', placeholder: 'RCC / Sheet / Tile / Ground Mount' },
      { label: 'Installation Address', placeholder: 'Full site location', multiline: true },
      { label: 'Phone Number', placeholder: 'Best number for follow-up' },
      { label: 'Additional Notes', placeholder: 'Any usage pattern or site concerns', multiline: true },
    ],
    panels: [
      {
        title: 'Document Uploads',
        description: 'Support electricity bill photos, roof visuals, and site evidence for early qualification.',
        icon: 'upload-file',
      },
      {
        title: 'Lead Quality',
        description: 'Structured inputs reduce callback time and improve quote accuracy.',
        icon: 'analytics',
      },
    ],
    ctaLabel: 'Submit Inquiry',
  },
  {
    slug: 'client-order-tracking',
    group: 'Client App',
    screenName: 'Order Tracking',
    title: 'Client Order and Installation Tracking',
    subtitle: 'Present the 7-stage solar journey in a way that feels transparent, calm, and actionable.',
    spotlight: {
      label: 'Order Status',
      value: 'Design Review',
      caption: 'Track quotation, payment, scheduling, installation, and handover with a clear stage pipeline.',
      icon: 'route',
    },
    metrics: [
      { label: 'Pipeline Stages', value: '7' },
      { label: 'Next Visit', value: 'Apr 05' },
      { label: 'Invoice Ready', value: 'Yes' },
    ],
    panels: [
      {
        title: 'Quotation Approval',
        description: 'Review and approve commercial proposals from within the same order flow.',
        icon: 'fact-check',
      },
      {
        title: 'Payment Milestones',
        description: 'Expose paid, pending, and upcoming amounts with receipts and due dates.',
        icon: 'payments',
      },
      {
        title: 'PDF Invoice Download',
        description: 'Invoices and receipts remain available for compliance and record-keeping.',
        icon: 'picture-as-pdf',
      },
    ],
    timeline: [
      { title: 'Inquiry Received', detail: 'Lead captured from app', active: true },
      { title: 'Site Survey', detail: 'Survey team assigned', active: true },
      { title: 'Quotation Sent', detail: 'Client approval pending', active: true },
      { title: 'Advance Payment', detail: 'Awaiting milestone payment' },
      { title: 'Installation', detail: 'Not started' },
      { title: 'Commissioning', detail: 'Pending' },
      { title: 'Final Handover', detail: 'Pending' },
    ],
    ctaLabel: 'Download Invoice',
  },
  {
    slug: 'client-notifications',
    group: 'Client App',
    screenName: 'Notifications',
    title: 'Client Notifications Center',
    subtitle: 'Keep quotation alerts, staff messages, and installation updates visible and easy to act on.',
    spotlight: {
      label: 'Alert Stream',
      value: 'Realtime',
      caption: 'Messages from staff, order changes, payment prompts, and schedule updates in one feed.',
      icon: 'notifications-active',
    },
    metrics: [
      { label: 'Unread', value: '5' },
      { label: 'Quotation Alerts', value: '2' },
      { label: 'Schedule Updates', value: '1' },
    ],
    panels: [
      {
        title: 'Priority Sorting',
        description: 'Urgent payment requests and quotation approvals surface above general updates.',
        icon: 'priority-high',
      },
      {
        title: 'Actionable Alerts',
        description: 'Every notification can deep-link into the right screen for approval or review.',
        icon: 'open-in-new',
      },
      {
        title: 'Read State',
        description: 'Unread indicators and grouped timelines keep the feed easy to scan.',
        icon: 'mark-email-read',
      },
    ],
    ctaLabel: 'Open Latest Alert',
  },
  {
    slug: 'staff-dashboard',
    group: 'Staff App',
    screenName: 'Staff Dashboard',
    title: 'Staff Sales Dashboard',
    subtitle: 'Prioritize leads, follow-ups, survey queues, and installation progress from one operational cockpit.',
    spotlight: {
      label: 'Lead Pulse',
      value: '26 New Leads',
      caption: 'Quick access to callbacks, survey demand, and work-in-progress installations for field teams.',
      icon: 'dashboard-customize',
    },
    metrics: [
      { label: 'Pending Calls', value: '11' },
      { label: 'Survey Queue', value: '7' },
      { label: 'Installations', value: '14 Active' },
    ],
    panels: [
      {
        title: 'Quick Lead Triage',
        description: 'Jump straight into the latest inquiries that need outreach today.',
        icon: 'support-agent',
      },
      {
        title: 'Reminder Focus',
        description: 'Callbacks and follow-up reminders prevent hot leads from going cold.',
        icon: 'alarm',
      },
      {
        title: 'Completion Summary',
        description: 'Daily installation outcomes and conversion snapshots help team leads rebalance work.',
        icon: 'check-circle',
      },
    ],
    ctaLabel: 'Open Lead Queue',
  },
  {
    slug: 'staff-leads-list',
    group: 'Staff App',
    screenName: 'Leads List',
    title: 'Staff Leads List',
    subtitle: 'Handle all incoming inquiries with search, filters, and CRM-style status visibility.',
    spotlight: {
      label: 'Lead View',
      value: 'Kanban + List',
      caption: 'Filter by source, stage, region, and urgency while keeping client communication one tap away.',
      icon: 'view-kanban',
    },
    metrics: [
      { label: 'All Leads', value: '148' },
      { label: 'Hot Leads', value: '19' },
      { label: 'Today’s Follow-ups', value: '13' },
    ],
    panels: [
      {
        title: 'Direct Call Action',
        description: 'Sales reps can call the client directly from the lead card or detail panel.',
        icon: 'call',
      },
      {
        title: 'Pipeline Filters',
        description: 'Sort by survey needed, quotation pending, or lost opportunity reasons.',
        icon: 'filter-alt',
      },
      {
        title: 'Requirement Snapshot',
        description: 'Each row shows location, desired load, roof type, and last activity.',
        icon: 'summarize',
      },
    ],
    ctaLabel: 'Review Lead Detail',
  },
  {
    slug: 'staff-lead-detail',
    group: 'Staff App',
    screenName: 'Lead Detail',
    title: 'Staff Lead Detail Workspace',
    subtitle: 'Give sales teams enough context to call, qualify, note, and schedule surveys without context switching.',
    spotlight: {
      label: 'Lead Workspace',
      value: 'Client + Site',
      caption: 'A single operational screen for client contact, notes, capacity estimate, and survey scheduling.',
      icon: 'manage-search',
    },
    metrics: [
      { label: 'Client Type', value: 'Residential' },
      { label: 'Estimate', value: '5 kW' },
      { label: 'Survey Slot', value: 'Apr 03, 11 AM' },
    ],
    fields: [
      { label: 'Internal Notes', placeholder: 'Conversation summary and objections', multiline: true },
      { label: 'Required Capacity (kW)', placeholder: 'Updated estimate after qualification' },
      { label: 'Survey Date', placeholder: 'Select preferred visit slot' },
    ],
    panels: [
      {
        title: 'Client Profile',
        description: 'Phone, address, bill amount, and uploaded documents stay visible alongside notes.',
        icon: 'badge',
      },
      {
        title: 'Requirement Details',
        description: 'Record constraints such as roof access, meter setup, or subsidy eligibility.',
        icon: 'description',
      },
      {
        title: 'Survey Scheduling',
        description: 'Assign and confirm a date and time with the installation or survey team.',
        icon: 'event-available',
      },
    ],
    ctaLabel: 'Schedule Survey',
  },
  {
    slug: 'staff-quotation-creation',
    group: 'Staff App',
    screenName: 'Quotation Creation',
    title: 'Staff Quotation Builder',
    subtitle: 'Turn a qualified lead into a professional solar quote with pricing, subsidy estimates, and delivery options.',
    spotlight: {
      label: 'Quote Builder',
      value: 'Dynamic Pricing',
      caption: 'Build system size, equipment, subsidy, and final price in one structured workflow.',
      icon: 'request-quote',
    },
    metrics: [
      { label: 'System Size', value: '6.5 kW' },
      { label: 'Subsidy Ready', value: '30%' },
      { label: 'Delivery', value: 'In-App + SMS' },
    ],
    fields: [
      { label: 'System Size (kW)', placeholder: 'Enter final system capacity' },
      { label: 'Equipment List', placeholder: 'Panels, inverter, battery, accessories', multiline: true },
      { label: 'Subsidy Estimate', placeholder: 'Applicable PM-KUSUM or state subsidy' },
      { label: 'Final Price', placeholder: 'Cost after subsidy and taxes' },
    ],
    panels: [
      {
        title: 'Equipment Builder',
        description: 'Select every major component and accessory included in the proposed system.',
        icon: 'build-circle',
      },
      {
        title: 'Automated Calculation',
        description: 'Use pricing rules to compute total cost before and after subsidy.',
        icon: 'calculate',
      },
      {
        title: 'Client Delivery',
        description: 'Send the quotation instantly through the app and over SMS.',
        icon: 'send',
      },
    ],
    ctaLabel: 'Send Quotation',
  },
  {
    slug: 'staff-order-creation',
    group: 'Staff App',
    screenName: 'Order Creation',
    title: 'Staff Order Creation',
    subtitle: 'Convert accepted quotations into execution-ready orders with sourcing, teams, dates, and milestone planning.',
    spotlight: {
      label: 'Order Setup',
      value: 'Execution Ready',
      caption: 'Track equipment needs, assign teams, plan visits, and define payment milestones.',
      icon: 'post-add',
    },
    metrics: [
      { label: 'Team Assignment', value: 'Required' },
      { label: 'Install Date', value: 'Planned' },
      { label: 'Milestones', value: '3 Payments' },
    ],
    fields: [
      { label: 'Equipment and Sourcing Notes', placeholder: 'Vendor, stock, dispatch notes', multiline: true },
      { label: 'Installation Team', placeholder: 'Assign coordinator or field crew' },
      { label: 'Installation Date', placeholder: 'Select planned start date' },
      { label: 'Payment Milestones', placeholder: 'Advance, mid-stage, final', multiline: true },
    ],
    panels: [
      {
        title: 'Order Kickoff',
        description: 'Create the official order record after the client confirms the quotation.',
        icon: 'playlist-add-check-circle',
      },
      {
        title: 'Coordination Layer',
        description: 'Combine logistics notes, team ownership, and timing in one operational handoff.',
        icon: 'groups',
      },
      {
        title: 'Financial Planning',
        description: 'Map the required payment stages before field work begins.',
        icon: 'account-balance-wallet',
      },
    ],
    ctaLabel: 'Create Order',
  },
  {
    slug: 'staff-installation-update',
    group: 'Staff App',
    screenName: 'Installation Update',
    title: 'Installation Update Screen',
    subtitle: 'Help coordinators update progress, upload evidence, and mark completion from the field.',
    spotlight: {
      label: 'Stage Update',
      value: 'Survey to Complete',
      caption: 'Advance the installation journey with field notes, photos, and completion confirmation.',
      icon: 'construction',
    },
    metrics: [
      { label: 'Photos', value: 'Upload Enabled' },
      { label: 'Current Stage', value: 'Started' },
      { label: 'Completion Proof', value: 'Required' },
    ],
    fields: [
      { label: 'Current Stage', placeholder: 'Survey / Started / Completed' },
      { label: 'Field Notes', placeholder: 'Progress updates, blockers, client comments', multiline: true },
      { label: 'Completion Summary', placeholder: 'Final installation remarks', multiline: true },
    ],
    panels: [
      {
        title: 'Photo Evidence',
        description: 'Capture roof setup, panel installation, inverter work, and final commissioning proof.',
        icon: 'add-a-photo',
      },
      {
        title: 'Status Transparency',
        description: 'Clients and admins both benefit from reliable, timestamped installation updates.',
        icon: 'visibility',
      },
      {
        title: 'Completion Workflow',
        description: 'Move the order into the final stage only after required evidence is logged.',
        icon: 'task-alt',
      },
    ],
    ctaLabel: 'Publish Update',
  },
  {
    slug: 'admin-dashboard',
    group: 'Admin Panel',
    screenName: 'Admin Dashboard',
    title: 'Admin Command Dashboard',
    subtitle: 'Summarize clients, leads, orders, revenue, and activity in a single management overview.',
    spotlight: {
      label: 'Business Pulse',
      value: '₹84.6L Revenue',
      caption: 'Track KPIs, conversion trends, active installations, and live operational signals.',
      icon: 'monitor',
    },
    metrics: [
      { label: 'Clients', value: '1,240' },
      { label: 'Leads', value: '386' },
      { label: 'Orders', value: '142' },
      { label: 'Conversion', value: '36.7%' },
    ],
    panels: [
      {
        title: 'KPI Summary',
        description: 'Top-line numbers for clients, leads, orders, and collections.',
        icon: 'leaderboard',
      },
      {
        title: 'Trend Charts',
        description: 'Sales and installation charts help leadership spot demand and capacity pressure.',
        icon: 'stacked-line-chart',
      },
      {
        title: 'Realtime Feed',
        description: 'Surface recent leads, quotations, approvals, and installation events.',
        icon: 'dynamic-feed',
      },
    ],
    ctaLabel: 'Open Analytics',
  },
  {
    slug: 'admin-product-management',
    group: 'Admin Panel',
    screenName: 'Product Management',
    title: 'Admin Product Management',
    subtitle: 'Maintain pricing, specifications, images, and product package structure across the platform.',
    spotlight: {
      label: 'Catalog Control',
      value: 'Editable Live',
      caption: 'Manage solar panels, inverters, batteries, and bundled offerings from one console.',
      icon: 'inventory',
    },
    metrics: [
      { label: 'Categories', value: '4' },
      { label: 'Images per SKU', value: 'Multiple' },
      { label: 'Pricing Mode', value: 'Dynamic' },
    ],
    panels: [
      {
        title: 'Add / Edit / Delete',
        description: 'CRUD controls for every product and package in the catalog.',
        icon: 'edit-square',
      },
      {
        title: 'Spec Management',
        description: 'Update wattage, battery cycle life, inverter compatibility, and warranty details.',
        icon: 'list-alt',
      },
      {
        title: 'Media Gallery',
        description: 'Upload multiple product images for richer product cards and details.',
        icon: 'collections',
      },
    ],
    ctaLabel: 'Add Product',
  },
  {
    slug: 'admin-staff-management',
    group: 'Admin Panel',
    screenName: 'Staff Management',
    title: 'Admin Staff Management',
    subtitle: 'Create accounts, assign roles, manage activation, and monitor staff performance across teams.',
    spotlight: {
      label: 'Team Operations',
      value: '42 Staff',
      caption: 'Sales executives, installation coordinators, and managers need role-specific controls and visibility.',
      icon: 'manage-accounts',
    },
    metrics: [
      { label: 'Sales Execs', value: '18' },
      { label: 'Coordinators', value: '12' },
      { label: 'Managers', value: '5' },
    ],
    panels: [
      {
        title: 'Role Assignment',
        description: 'Control privileges for sales, operations, and management roles.',
        icon: 'admin-panel-settings',
      },
      {
        title: 'Activation Controls',
        description: 'Enable and disable accounts without deleting historical ownership.',
        icon: 'toggle-on',
      },
      {
        title: 'Performance View',
        description: 'Connect staff accounts to lead conversion and project completion metrics.',
        icon: 'query-stats',
      },
    ],
    ctaLabel: 'Create Staff Account',
  },
  {
    slug: 'admin-lead-management',
    group: 'Admin Panel',
    screenName: 'Lead Management',
    title: 'Admin Lead Monitoring',
    subtitle: 'Oversee lead flow, assignments, conversion health, and bottlenecks across the full funnel.',
    spotlight: {
      label: 'Lead Governance',
      value: '386 Open',
      caption: 'Watch the entire lead-to-order journey with filters, assignments, and staff accountability.',
      icon: 'supervisor-account',
    },
    metrics: [
      { label: 'Assigned', value: '271' },
      { label: 'Unassigned', value: '18' },
      { label: 'Converted', value: '97' },
    ],
    panels: [
      {
        title: 'Advanced Search',
        description: 'Search by location, stage, staff owner, source, or expected capacity.',
        icon: 'search',
      },
      {
        title: 'Assignment Oversight',
        description: 'See which staff members own each lead and how quickly they respond.',
        icon: 'assignment-ind',
      },
      {
        title: 'Pipeline Health',
        description: 'Identify stages where leads are stalling before conversion.',
        icon: 'timeline',
      },
    ],
    ctaLabel: 'Review Pipeline',
  },
  {
    slug: 'admin-order-management',
    group: 'Admin Panel',
    screenName: 'Order Management',
    title: 'Admin Order Management',
    subtitle: 'Monitor progress across all clients, teams, and project stages without losing operational context.',
    spotlight: {
      label: 'Order Oversight',
      value: '142 Running',
      caption: 'Track installation movement, milestone payments, and schedule risk across all orders.',
      icon: 'fact-check',
    },
    metrics: [
      { label: 'In Survey', value: '21' },
      { label: 'Installing', value: '37' },
      { label: 'Commissioning', value: '11' },
    ],
    panels: [
      {
        title: 'Global Progress Monitor',
        description: 'See every order stage in one board with client, location, and owner details.',
        icon: 'travel-explore',
      },
      {
        title: 'Risk Visibility',
        description: 'Catch delays, payment blockers, and manpower conflicts early.',
        icon: 'warning-amber',
      },
      {
        title: 'Cross-Team Context',
        description: 'Align sales, operations, and installation teams around the same order truth.',
        icon: 'hub',
      },
    ],
    ctaLabel: 'Open Order Monitor',
  },
  {
    slug: 'admin-reports-analytics',
    group: 'Admin Panel',
    screenName: 'Reports & Analytics',
    title: 'Reports and Analytics',
    subtitle: 'Turn operational data into exportable sales, revenue, performance, and subsidy insights.',
    spotlight: {
      label: 'Reporting Suite',
      value: 'PDF + Excel',
      caption: 'Generate monthly, quarterly, and role-wise reports with subsidy and location coverage.',
      icon: 'assessment',
    },
    metrics: [
      { label: 'Sales Reports', value: 'Monthly' },
      { label: 'Collections', value: 'Realtime' },
      { label: 'Location Map', value: 'Enabled' },
    ],
    panels: [
      {
        title: 'Revenue Reports',
        description: 'Break down billed, collected, pending, and overdue amounts.',
        icon: 'payments',
      },
      {
        title: 'Staff Performance',
        description: 'Compare lead handling, conversion, and completion metrics by team member.',
        icon: 'bar-chart',
      },
      {
        title: 'Installation Statistics',
        description: 'Location-based reporting shows where projects and subsidies are concentrated.',
        icon: 'map',
      },
    ],
    ctaLabel: 'Export Report',
  },
  {
    slug: 'landing-page',
    group: 'Landing Page',
    screenName: 'Single Page Landing Page',
    title: 'Business Landing Page',
    subtitle: 'Present the company, products, benefits, and inquiry flow in a polished public-facing solar website.',
    spotlight: {
      label: 'Public Presence',
      value: 'Lead Generation',
      caption: 'Hero messaging, trust, products, benefits, and an inquiry section tuned for solar conversion.',
      icon: 'language',
    },
    metrics: [
      { label: 'Responsive', value: 'Mobile + Web' },
      { label: 'SEO Ready', value: 'Basic Setup' },
      { label: 'Contact Modes', value: 'Phone + WhatsApp' },
    ],
    panels: [
      {
        title: 'Hero and Value Proposition',
        description: 'Use a clean solar-first hero with CTA buttons for quote requests and contact.',
        icon: 'rocket-launch',
      },
      {
        title: 'About, Products, Benefits',
        description: 'Introduce the business, highlight product categories, and explain savings plus sustainability.',
        icon: 'storefront',
      },
      {
        title: 'Inquiry and Contact',
        description: 'Capture leads with a simple form and direct communication options.',
        icon: 'perm-phone-msg',
      },
    ],
    ctaLabel: 'Launch Landing Experience',
  },
];

export const solarNeedsGroups = ['Client App', 'Staff App', 'Admin Panel', 'Landing Page'] as const;

export function getSolarScreen(slug: string) {
  return solarNeedsScreens.find((screen) => screen.slug === slug);
}
