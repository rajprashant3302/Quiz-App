# SkillifyMe - Course Registration & Invoice System

**SkillifyMe** is a web and PDF-based course registration system designed to provide a seamless user experience for students registering for online or offline courses. It automatically generates invoice-style PDFs with all user and course details and supports coupon discounts.

---

## Table of Contents
1. [Project Overview](#project-overview)  
2. [Tech Stack](#tech-stack)  
3. [Architecture](#architecture)  
4. [User Flow](#user-flow)  
5. [Features](#features)  
6. [Installation & Setup](#installation--setup)  
7. [How It Works](#how-it-works)  
8. [Directory Structure](#directory-structure)  
9. [Contributing](#contributing)  
10. [License](#license)  

---

## Project Overview

SkillifyMe allows users to:
- Register for one or multiple courses.  
- Select course modes (online/offline).  
- Apply coupons for discounts.  
- Automatically generate PDF invoices with all details.  

The system is designed for simplicity, scalability, and a professional user experience.

---

## Tech Stack

| Layer            | Technology / Library                | Purpose |
|-----------------|------------------------------------|---------|
| Frontend        | **React.js**                        | User interface & components |
| Styling         | **Material-UI (MUI)**               | UI design, components, and layouts |
| PDF Generation  | **jsPDF**                            | Client-side PDF generation |
| State Management| **React Hooks** (`useState`, `useEffect`) | Manage component state and effects |
| Backend         | **Node.js + Express.js**             | API endpoints for user registration, coupon validation, etc. |
| Database        | **Firebase / JSON**                  | Store users, courses, and coupon data |
| Hosting         | **Render / GitHub Pages**            | Host backend/frontend |
| Version Control | **Git + GitHub**                     | Repository & versioning |

---

      ┌────────────┐
      │   User     │
      └─────┬──────┘
            │
   React Frontend (MUI)
            │
    ┌───────┴────────┐
    │  API Requests  │
    │  Axios/Fetch   │
    └───────┬────────┘
            │
      Node.js + Express
            │
  ┌─────────┴─────────┐
  │  Firebase / JSON   │
  └─────────┬─────────┘
            │
       Data Persistence



---

## User Flow



1. **User Registration**
    -Shows registration form
   - User enters personal details (`name, email, phone, institution`).  
   - Selects one or more courses.  
   - Applies coupon (optional).

 3. **Landing Page**
   - Select course from courses list.
   - Coupons is applied if applicable
   - Payment generation

4. **Invoice Generation**
   - After successful registration, a PDF invoice is generated.  
   - Includes:
     - User Info
     - All registered course details (with blue info boxes)
     - Coupon applied
     - Grand Total
     - Signature & Footer  

5. **Download / Print**
   - User can download or print the invoice.

---

## Features

- **Multiple Course Registration** – Register for one or many courses.  
- **Coupon Discounts** – Apply promo codes to reduce price.  
- **Invoice PDF** – Automatic professional PDF with detailed info.    
- **Responsive UI** – Works across devices using Material-UI.  
- **User-friendly Architecture** – Easy to extend, scalable.

---

## Installation & Setup

**Clone Repository:**
```bash
git clone https://github.com/username/SkillifyMe.git](https://github.com/rishitaggarwal1/skillifyme_client.git
cd skillifyme_client


## Architecture

