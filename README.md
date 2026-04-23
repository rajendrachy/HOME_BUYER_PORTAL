# 🏛️ HomeBuyer Portal: National Housing Subsidy Management Infrastructure

## 📋 Project Overview
**HomeBuyer Portal** is a high-fidelity, government-grade digital infrastructure designed to modernize and secure the national housing subsidy lifecycle. The platform serves as a centralized "Identity Hub" where citizens can apply for government housing grants, municipality officers can verify eligibility, and financial institutions can offer competitive mortgage financing.

Built with a focus on **Security, Transparency, and Operational Efficiency**, the platform replaces fragmented manual processes with a cryptographically verified digital pipeline.

---

## ✨ Core Features

### **1. Secure Identity Hub**
*   **Centralized Dossier**: A unified digital profile where citizens manage personal, financial, and property metadata.
*   **Cryptographic Verification**: Every stage of the application is tracked and verified against government standards.
*   **Interactive Journey Tracker**: A high-fidelity visual stepper that provides citizens with real-time transparency into their application status.

### **2. Role-Based Command Centers**
The platform features specialized dashboards tailored to the specific mandates of four key stakeholders:
*   **Citizens**: Initiate applications, upload legal documentation, and authorize bank integrations.
*   **Municipality Officers**: Audit digital dossiers, verify legal documents, and authorize subsidy allocations.
*   **Bank Officers**: Access pre-verified leads and submit customized mortgage offers (Interest Rate, EMI, Tenure).
*   **Super Admins**: Monitor national throughput via geospatial heatmaps and manage the global identity directory.

### **3. Advanced Security Protocols**
*   **Multi-Factor Authentication (2FA)**: Mandatory TOTP verification for all administrative and citizen accounts.
*   **Disaster Recovery**: 8-digit cryptographic recovery codes for secure account restoration.
*   **Digital Audit Trail**: Every status transition is logged with a timestamp and the initiating authority's signature.

---

## 🏗️ System Architecture & Workflow

### **The Application Lifecycle**
1.  **Submission Phase**: The citizen logs a "Dossier Entry" with personal, employment, and property valuation data.
2.  **Verification Phase**: Municipality Officers perform a "File Audit" on uploaded documents (Citizenship, Income, Land Ledger).
3.  **Authorization Phase**: Upon successful verification, the government "Subsidy Valve" is unlocked, granting the fiscal allocation.
4.  **Financial Integration**: Competitive banks review the approved application and submit "Mortgage Directives."
5.  **Finalization**: The citizen "Accepts" a bank offer, triggering the final financial synchronization and disbursement.

---

## 🛠️ Technical Stack

| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | High-performance, premium UI layer with Framer Motion animations. |
| **Styling** | Vanilla CSS + Tailwind | Modern, government-grade design system with Glassmorphism. |
| **Backend** | Node.js + Express | Robust RESTful API and secure business logic processing. |
| **Database** | MongoDB | Document-oriented storage for complex, multi-faceted dossiers. |
| **Authentication**| JWT + 2FA | Secure session management and multi-layer verification. |
| **Storage** | Cloudinary | Encrypted storage for official scanned documentation. |

---

## ⚙️ Installation & Deployment Protocol

### **1. Clone the Infrastructure**
```bash
git clone https://github.com/rajendrachy/HOME_BUYER_PORTAL.git
cd HOME_BUYER_PORTAL
```

### **2. Backend Configuration**
Initialize the core processing unit:
```bash
cd backend
npm install
```
**Configure Environment Variables (`.env`):**
Create a `.env` file in the `backend` directory with these keys:
```env
PORT=
MONGODB_URI=
JWT_SECRET=
NODE_ENV=
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### **3. Database Initialization**
Wipe existing data and seed professional demo nodes:
```bash
node seed.js
```

### **4. Frontend Configuration**
Initialize the UI layer:
```bash
cd ../frontend
npm install
```
**Environment Setup (`.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### **5. Execution**
*   **Backend**: `npm run dev` (from `/backend`)
*   **Frontend**: `npm run dev` (from `/frontend`)

---

## 🏛️ Deployment Strategy
*   **Frontend**: Optimized for **Vercel** with dynamic API origin mapping.
*   **Backend**: Optimized for **Render/Heroku** with secure environment variable injection.
