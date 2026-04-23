# 🏛️ HomeBuyer Portal: National Housing Subsidy Infrastructure

Welcome to the **HomeBuyer Portal**, a high-fidelity, government-grade platform designed to digitize and secure the national housing subsidy lifecycle. This document provides an "Interview-Style" deep dive into the system's architecture, role-based workflows, and security protocols.

---

## 🎙️ The "Interview" Breakdown

### **Q1: What is the core problem this platform solves?**
The platform eliminates the "Paper-Trail Friction" in government housing grants. Traditionally, citizens had to visit multiple offices (Municipality, Land Registry, Banks) with physical folders. **HomeBuyer Portal** centralizes this into a single **Secure Identity Hub**, where applications move through a cryptographically verified pipeline from submission to bank disbursement.

### **Q2: Can you explain the Role-Based Access Control (RBAC) in detail?**
The system operates on four distinct "Operational Tiers," each with a specific mandate:

#### **1. 👤 The Citizen (Identity Node)**
*   **The Mandate**: Initiate and track the housing journey.
*   **Workflow**: 
    *   **Identity Protocol**: Submit a multi-step application including personal metadata, financial standing, and family context.
    *   **Dossier Upload**: Securely upload scanned legal documents (Citizenship, Income, Property Ledger).
    *   **Journey Tracking**: Monitor real-time progress via an interactive, five-stage visual tracker.
    *   **Bank Integration**: Once a subsidy is approved, the Citizen reviews mortgage offers from competitive banks and "Authorizes Integration" with their preferred financial partner.

#### **2. 🏛️ The Municipality Officer (Verification Authority)**
*   **The Mandate**: Audit and authenticate citizen eligibility.
*   **Workflow**:
    *   **Dossier Audit**: Access a centralized "Record Ledger" of all applications within their jurisdiction.
    *   **File Verification**: Examine uploaded documents and cross-reference with land records.
    *   **Subsidy Valve**: Decide to Approve or Reject the application. Upon approval, they unlock the "Subsidy Valve" (allocating government funds).

#### **3. 🏦 The Bank Officer (Financial Integration)**
*   **The Mandate**: Provide competitive mortgage financing to verified subjects.
*   **Workflow**:
    *   **Portfolio Leads**: Access a stream of "Market Leads"—citizens who have already been pre-verified and approved for a government grant.
    *   **Mortgage Issuance**: Calculate and submit customized mortgage offers (Interest Rate, EMI, Tenure) directly into the Citizen's dossier.
    *   **Asset Liquidity**: Finalize the loan disbursement once the Citizen "Accepts" the offer.

#### **4. 🛡️ The Super Admin (Command Center)**
*   **The Mandate**: System-wide surveillance and identity directory management.
*   **Workflow**:
    *   **National Overview**: Monitor "National Throughput" via geospatial heatmaps and status distribution analytics.
    *   **Identity Directory**: Manage all users across the network, with the power to "Suspend" or "Verify" access tiers.
    *   **Mainframe Health**: Oversee the integrity of the database and encryption layers.

---

### **Q3: Describe the "Application Lifecycle" (The Journey).**
The journey follows a strict **Security Protocol**:
1.  **Submission**: Citizen logs their entry; the system creates a unique **Application Token** (e.g., `#APP-2026-X`).
2.  **Verification**: Municipality Officer audits the file. Status transitions to `UNDER_REVIEW`.
3.  **Authorization**: Officer grants the subsidy. Status transitions to `APPROVED`.
4.  **Market Competition**: Banks see the lead and submit offers.
5.  **Integration**: Citizen selects a Bank. Status transitions to `BANK_SELECTED`.
6.  **Finalization**: Bank disbursements complete the loop. Status: `COMPLETED`.

### **Q4: How does the system handle high-security requirements?**
We implement **"Government-Grade" Security**:
*   **Identity Layer**: Multi-Factor Authentication (2FA) via TOTP (Authenticator Apps).
*   **Recovery Protocol**: 8-digit cryptographic recovery codes for "Lost Device" scenarios.
*   **Encryption**: Sensitive documents are stored with unique hash references.
*   **Audit Trail**: Every status change is logged with a timestamp and the initiating officer's digital signature.

---

## 🛠️ Technical Stack (The Engine)

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | High-fidelity, responsive UI with TailwindCSS & Framer Motion. |
| **Backend** | Node.js + Express | RESTful API infrastructure and secure business logic. |
| **Database** | MongoDB + Mongoose | Document-oriented storage for complex application dossiers. |
| **Security** | JWT + bcrypt | Stateless authentication and professional-grade password hashing. |
| **Visualization** | Recharts + Leaflet | Data analytics and Geospatial audit heatmaps. |

---

## ⚙️ Installation & Deployment Protocol

Follow these precise steps to synchronize the platform on your local mainframe:

### **1. Clone the Infrastructure**
```bash
git clone https://github.com/your-repo/home-buyer-portal.git
cd home-buyer-portal
```

### **2. Backend Synchronization**
Initialize the core processing unit and environment:
```bash
cd backend
npm install
```
**Configure Environment Variables (`.env`):**
Create a `.env` file in the `backend` directory with the following cryptographic and operational keys:
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
Wipe existing data and seed the professional demo nodes:
```bash
node seed.js
```

### **4. Frontend Interface Setup**
Initialize the high-fidelity UI layer:
```bash
cd ../frontend
npm install
```
**Configure Environment (`.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### **5. Execution**
Launch both nodes to activate the portal:
*   **Backend**: `npm run dev` (from `/backend`)
*   **Frontend**: `npm run dev` (from `/frontend`)

---

## 🏛️ Deployment (Vercel & Render)
*   **Frontend**: Optimized for Vercel deployment. Ensure `VITE_API_URL` points to your production backend.
*   **Backend**: Optimized for Render/Heroku. Ensure `MONGODB_URI` and `JWT_SECRET` are set in the environment dashboard.

