# Amar City – Team Launch Checklist Application

A clean, responsive, real-time web application for the **Amar City** team to track and manage all 77 operational launch preparation tasks across 10 distinct categories.

Built with **React**, **Vite**, **Tailwind CSS**, and **Firebase** (Firestore, Authentication, Hosting) on the **Firebase Spark (Free) Plan**.

---

## 🚀 Key Features

- **Real-Time Live Synchronization**: All checklist toggles and task updates sync instantly across all team members' screens without needing to refresh, powered by Firestore's `onSnapshot()` listener.
- **77 Launch Tasks & 10 Operational Categories**: Full coverage of Brand, Play Store, Marketing, Studio Equipment, Offline Media, Campaigns, Operations, Launch Day, and Post-Launch Monitoring.
- **Initial Progress State**: Pre-configured with the 8 completed tasks (~10% progress: Brand & Company Readiness 2/5, Google Play Store 5/9, Offline Marketing Materials 1/7).
- **Automated Metric Calculation**: Total tasks, completed tasks, remaining tasks, and overall percentage calculate dynamically from Firestore data.
- **Secure Team-Only Authentication**: Email/Password authentication. Public registration is disabled to ensure only authorized team members can access and update checklist data.
- **Single Shared Document**: All team members collaborate on the same Firestore document (`checklists/amar-city-launch`), ensuring zero data drift or fragmentation.
- **Responsive & Clean UI**: Designed with Amar City's brand colors, subtle grey sections, clean typography (Bengali and English support via Hind Siliguri and Inter), and intuitive collapsible categories.
- **Spark Plan (Free Tier) Optimized**: Uses a single shared document design that requires only 1 read per session load and 1 write per task toggle, staying well within Firebase's 50,000 free reads/day quota.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Cloud Firestore (`onSnapshot` real-time listeners)
- **Hosting**: Firebase Hosting (Single Page Application configuration)

---

## 📂 Project Structure

```text
cheaklist/
├── src/
│   ├── components/
│   │   ├── CategorySection.jsx    # Collapsible accordion for each category
│   │   ├── Header.jsx             # Amar City logo, title, sync badge, user info
│   │   ├── LoginModal.jsx         # Email/password authentication modal
│   │   ├── ProgressSummary.jsx    # Metrics cards & progress bar
│   │   ├── ResetModal.jsx         # Confirmation modal to restore initial state
│   │   └── TaskItem.jsx           # Task checkbox, title, completed styling
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state listener and login/logout handlers
│   ├── checklistData.js           # 77 tasks definition & initial 8 completed state
│   ├── firebase.js                # Firebase initialization & Firestore sync helpers
│   ├── App.jsx                    # Root checklist application
│   ├── index.css                  # Tailwind styles
│   └── main.jsx                   # Entry point
├── firestore.rules                # Security rules restricting access to authenticated team
├── firebase.json                  # Firebase Hosting and Firestore configuration
├── .firebaserc                    # Firebase project alias
├── .env.example                   # Template for Firebase credentials
└── package.json
```

---

## ⚙️ Firebase Setup Step-by-Step

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and enter a name (e.g., `amar-city-checklist`).
3. You can disable Google Analytics or leave it enabled, then click **Create Project**.
4. Make sure your project is on the **Spark Plan (Free)**.

### 2. Enable Email & Password Authentication
1. In the Firebase Console left sidebar, click **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Enable **Email/Password** (do NOT enable "Email link / passwordless").
5. Click **Save**.

### 3. Create Team Member Accounts (Manual Admin Provisioning)
Per requirements, public registration is disabled so only authorized team members can log in:
1. Under **Authentication**, open the **Users** tab.
2. Click **Add user**.
3. Enter the team member's email (e.g., `lead@amarcity.com`) and a secure password.
4. Click **Add user**.
5. Repeat for any other team members who need access.

### 4. Create Firestore Database
1. In the sidebar, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location (select the closest region, e.g. `asia-south1` or `us-central1`).
4. Select **Start in production mode** and click **Create**.

### 5. Apply Firestore Security Rules
1. In the Firestore section, click the **Rules** tab.
2. Copy and paste the contents of `firestore.rules` from this project:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       function isAuthenticated() {
         return request.auth != null && request.auth.uid != null;
       }
       match /checklists/{documentId} {
         allow read, create, update: if isAuthenticated();
         allow delete: if false;
       }
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
3. Click **Publish**.

### 6. Register Web App & Configure Environment Variables
1. Click the ⚙️ gear icon next to **Project Overview** in the Firebase sidebar > **Project settings**.
2. In the **General** tab, scroll down to **Your apps** and click the Web icon (`</>`).
3. Enter App nickname (e.g., `amar-city-web`), and click **Register app**.
4. You will see a `firebaseConfig` object with `apiKey`, `authDomain`, `projectId`, etc.
5. In your project directory, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
6. Fill in the values in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=amar-city-checklist.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=amar-city-checklist
   VITE_FIREBASE_STORAGE_BUCKET=amar-city-checklist.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:...
   ```

---

## 🏃 Running the Application Locally

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

> **Automatic Document Initialization**:
> The first time any authenticated team member logs in, the app automatically checks Firestore for the `amar-city-launch` document. If it doesn't exist, it automatically creates it with the full list of 77 tasks and the initial 8 completed tasks!

---

## 🧪 Testing Live Multi-User Synchronization

1. Start the app locally: `npm run dev`
2. Open `http://localhost:3000` in two different browser windows (or an Incognito window).
3. Log in with your team credentials in both windows.
4. In Window A, check any task (e.g., *Brand & Company Readiness: App-এর মূল উদ্দেশ্য ও user benefits স্পষ্টভাবে নির্ধারণ করা*).
5. Notice that Window B updates immediately in real time without refreshing the page!
6. Notice the progress percentage, completed count, and remaining count update automatically on both screens.
7. Refresh the page: the checked state remains safely saved in Firestore.

---

## 🌐 Deploying to Firebase Hosting

```bash
# 1. Build the production bundle
npm run build

# 2. Login to Firebase CLI (if not already logged in)
firebase login

# 3. Associate your project (if not already done)
firebase use --add

# 4. Deploy Firestore rules and static hosting bundle
firebase deploy
```

Once deployment completes, Firebase CLI will provide the live hosting URL (e.g., `https://amar-city-checklist.web.app`).

---

## 📋 Initial Checklist Summary (77 Tasks)

| # | Category | Total | Completed Initially |
|---|---|:---:|:---:|
| 1 | Brand & Company Readiness | 5 | 2 |
| 2 | Google Play Store Readiness | 9 | 5 |
| 3 | Official Digital Presence | 8 | 0 |
| 4 | Marketing Content Preparation | 8 | 0 |
| 5 | Marketing Equipment & Studio | 7 | 0 |
| 6 | Offline Marketing Materials | 7 | 1 |
| 7 | Launch Campaign Planning | 10 | 0 |
| 8 | Team & Operational Readiness | 7 | 0 |
| 9 | Launch Day Preparation | 7 | 0 |
| 10 | Post-Launch Monitoring | 9 | 0 |
| **Total** | **All Categories** | **77** | **8 (~10%)** |

---

## 🔒 Security & Data Integrity

- Unauthenticated visitors are redirected to the clean login screen and cannot view tasks.
- Only authenticated Firebase accounts can read and write to the shared document.
- Firebase service account secrets are never exposed to the client; all client requests use standard Firebase Web SDK credentials secured by server-side Firestore security rules.
- Accidental document deletion is disabled in `firestore.rules`.
