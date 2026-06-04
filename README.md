# CivicBuild Connect

**Manage projects. Verify field progress. Release payments with confidence.**

CivicBuild Connect is a full-stack project management platform prototype designed to connect government/private client organizations with paving and infrastructure field contractors. It provides robust tools for managing structural field tasks: generating AI-driven work orders, verifying contractor site check-ins via GPS, and releasing funds from escrow using a test-mode payment gateway.

---

## 🚀 Key Prototype Highlights (Reviewers & Graders)

> [!IMPORTANT]
> **Zero-Configuration Demo Mode (Fallback):**
> Setting up third-party credentials (Clerk, Mapbox, Cloudinary, OpenAI, Stripe) is optional. If key environment variables are missing, the platform automatically activates **Demo Mode fallbacks**:
> * **Mock Auth Portal:** The `/sign-in` and `/sign-up` routes display a developer portal letting you select and log in as any of our seeded personas (Client, Contractor, Admin) with **one click**.
> * **Mock Geolocation Maps:** Displays physical pins, routes, and precision readouts on an Austin, TX SVG dashboard map without Mapbox token crashes.
> * **Mock Uploads:** Files are instantly base64 data-URL encoded and stored directly in MongoDB, allowing progress photo displays to work offline.
> * **Mock AI Scope:** Generates a structured scope and milestone schedule dynamically using category templates.
> * **Stripe Test Mode:** Simulates escrow creation and payouts.

---

## 🛠️ Technology Stack

* **Frontend & Backend Application:** Next.js (App Router, Server Actions, Route Handlers), React, TypeScript
* **Styling & UI Components:** Tailwind CSS, shadcn/ui, Lucide Icons, Sonner (Toaster)
* **Database & Modeling:** MongoDB (Atlas / Local), Mongoose schemas, Zod validations
* **Authentication & Guarding:** Clerk (Public metadata role guards & optional MFA) / Custom JWT cookies fallback
* **GPS & Maps:** Geolocation API (Browser coordinates) & Mapbox GL JS (Dynamic pins)
* **File Uploads:** Cloudinary (Signed client uploads) / Base64 DB store fallback
* **Payments Gateway:** Stripe Connect Node (Payment intents, escrow simulation)
* **Artificial Intelligence:** OpenAI Node SDK (Structured schema JSON output)

---

## 📂 Project Structure

```text
src/
  app/
    (public)/            # Public marketing routes (landing page, How It Works, Security)
    (auth)/              # Authentication views (Sign-in, Sign-up, Onboarding)
    dashboard/
      client/            # Client features (projects creation, contractor search, approvals)
      contractor/        # Contractor features (job accepts, GPS check-ins, deliverables uploads)
      admin/             # Admin features (disputes, users verification, contacts, audit log)
    api/                 # Server endpoints (AI, GPS, Uploads, Payments, Assignments)
  components/
    ui/                  # shadcn reusable components
    layout/              # Common headers, sidebars, providers
    projects/            # Multistep forms, detail panels
    maps/                # Mapbox GL / SVG fallback map components
  lib/                   # MongoDB connect, Clerk/Mock auth wrappers, OpenAI, Stripe clients
  models/                # Mongoose database models (User, Project, Milestone, Payment, AuditLog)
  scripts/
    seed.ts              # Database database seed scripts
```

---

## ⚙️ Local Setup Instructions

### 1. Clone & Install Dependencies
Ensure you have Node.js 18+ and npm installed.
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (use `.env.example` as a template):
```env
NEXT_PUBLIC_APP_NAME="CivicBuild Connect"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# MongoDB Connection
MONGODB_URI="mongodb://localhost:27017/civicbuild_connect"
MONGODB_DB_NAME="civicbuild_connect"
```

### 3. Run the Database Seed Script
To insert our three demo personas, projects, and milestones into your database, seed the database by running:
```bash
# Start your local server and visit:
http://localhost:3000/api/seed
# Or run direct from terminal (if tsx/ts-node is global)
```
*(Seeding can be triggered dynamically from the dashboard login page or `/api/seed` in your browser!)*

### 4. Boot the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the platform.

---

## 🧭 Step-by-Step Demo Presentation Journey

1. **Marketing Site:** Browse `/`, `/how-it-works`, and `/security` to see professional SaaS layouts.
2. **Client Login:** Go to `/sign-in` and click **"City Infrastructure Dept (Client)"** to log in.
3. **Project Creation:** Click **"Create Project"** to load our 5-step form.
   * Enter details, select category "Asphalt Repair".
   * In Step 4, click **"Generate AI Work Order"** to watch the AI draft scope checklists and break down milestones automatically.
   * Go to Step 5 and click **"Publish Project"**.
4. **Contractor Search:** Visit the **Contractors** directory to explore qualified pavers, then assign the newly created project to **Lone Star Surface Repairs**.
5. **Contractor Response:** Sign out, sign in as **"Lone Star Surface Repairs (Contractor)"**. Open your active job, review terms, and click **"Accept Assignment"**.
6. **GPS & Photo submission:** 
   * Click **"Submit GPS Check-In"** to capture coordinates.
   * Under Milestone 1, click **"Start Milestone Work"**.
   * Fill out the deliverables form, select a progress photo, and click **"Submit Milestone Evidence"**.
7. **Client Sign-off:** Log back in as **Client**. Open the project, select the pending Milestone, click **"Fund Milestone"** (stripe test mode), inspect coordinates/photo, and click **"Approve Milestone"**.
8. **Payout Release:** Once approved, click **"Release Milestone Payout"**. The transaction settles instantly.
9. **Admin Audits:** Log in as **"Platform Administrator"**. Check global GPS logs on the map, review contacts/testimonials, and inspect the chronological **Audit Logs** timeline.

---

## 🔒 Security & Prototype Limitations

* **GPS Consent:** Geolocation coordinates are captured **only** when the contractor intentionally clicks the check-in button. Background hidden tracking is disabled.
* **Escrow Account Boundaries:** This is a test demonstration. Real KYC, production banking setups, and legal escrow holdings are not active. Stripe is in test mode.
