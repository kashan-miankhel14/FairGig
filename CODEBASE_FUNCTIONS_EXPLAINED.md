# 📖 FAIRGIG: COMPLETE CODEBASE & FUNCTION-BY-FUNCTION EXPLANATION

This document breaks down *every single important file* and *every major function* in the FairGig project. If a judge points to a file and asks "What does this do?", the exact answer is here.

---

## 🏗️ PART 1: THE FRONTEND (Next.js / React)
**Location:** `/app` and `/lib` directories

### 1. `app/layout.tsx`
This is the root wrapper for the entire application. Every page loads *inside* this file.
*   **`RootLayout({ children })` function**: 
    *   **What it does**: It takes the current page (`children`), wraps it in an HTML `<body>`, applies the `Inter` font, and wraps it in the `<AuthProvider>`. 
    *   **Why**: This ensures the styling and authentication state are global.

### 2. `lib/auth-context.tsx`
This file manages user login sessions using React Context so you don't have to keep logging in on every page.
*   **`AuthProvider` component**: Wraps the app. It uses `useEffect` to listen to Supabase for login/logout events.
*   **`useAuth()` hook**: A custom React hook. Any page can call `const { user, session } = useAuth()` to instantly know if the user is logged in and what their user ID is.

### 3. `lib/supabase.ts`
The database connection string.
*   **`createClient()` function**: Uses `process.env.NEXT_PUBLIC_SUPABASE_URL` to establish a connection to your Supabase PostgreSQL database. This client is imported everywhere.

### 4. `app/page.tsx` (Landing Page)
The marketing homepage.
*   **`Home()` function**: Returns the massive JSX structure for the landing page. It contains the Hero section, the feature cards (Log Earnings, Verify, Grievances), and the call-to-action buttons. It includes the logic to check if a user is logged in and conditionally shows "Go to Dashboard" vs "Login".

### 5. `app/dashboard/page.tsx` (Worker View)
This is where gig workers (Foodpanda, Bykea) see their data.
*   **`fetchEarnings()` function**: Connects to Supabase, pulls all earnings where `user_id == current_user`, and stores them in React state.
*   **`checkAnomalies()` function**: Sends the worker's earnings data to the Python `anomaly_service`. It receives a list of "flagged" shifts.
*   **`EarningsChart` Component**: Uses the `Recharts` library to draw the Line Chart showing income over time.
*   **`LogShiftModal` Component**: A popup form that lets workers manually type in their shift hours, platform (e.g., Daraz), and total earned. It sends a `POST` request to the `earnings_service`.

### 6. `app/advocate/page.tsx` (Union / Organizer View)
This is where organizers view city-wide data.
*   **`fetchCityMedians()` function**: Calls the `analytics_service` to get the average hourly rate for Lahore, Karachi, and Islamabad.
*   **`fetchVulnerableWorkers()` function**: Calls the database to find workers who have the highest number of "Anomalies" (unfair pay cuts).
*   **`resolveGrievance(id)` function**: A button click handler that sends a `PUT` request to the Node.js grievance service to mark a community complaint as "Resolved".

---

## 🐍 PART 2: THE PYTHON MICROSERVICES (FastAPI)
**Location:** `/backend/services/`

### 1. `auth_service/main.py`
Handles login security.
*   **`verify_token(token: str)` function**: When the frontend sends a JWT token, this function uses the `SUPABASE_JWT_SECRET` to decode it. If the token is fake or expired, it throws an `HTTPException 401 Unauthorized`.
*   **`@app.get("/me")` route**: A test route that returns the decoded user profile if the token is valid.

### 2. `earnings_service/main.py`
Handles saving and retrieving shift data.
*   **`class Shift(BaseModel)`**: A Pydantic data model. It forces the frontend to send data in a strict format (platform name must be string, amount must be float).
*   **`@app.post("/log")` route**: Takes the shift data from the frontend and inserts it into the Supabase `earnings` table.
*   **`@app.post("/upload_csv")` route**: *Advanced function.* It reads a raw CSV file uploaded by the worker (e.g., an export from the Uber app), parses it line-by-line using Python's `csv` module, and bulk-inserts hundreds of shifts into the database at once.

### 3. `anomaly_service/main.py`
The mathematical brain of the operation.
*   **`calculate_z_score(value, mean, std_dev)` function**: Math formula: `(value - mean) / std_dev`.
*   **`@app.post("/detect")` route**: 
    1. It receives an array of the worker's shifts.
    2. It loops through them and uses standard Python math functions to find the Average (mean) hourly rate.
    3. It runs the Z-score function on the *latest* shift. 
    4. If the latest shift is `< 20%` of the average, it returns `{"is_anomalous": True, "reason": "Severe algorithm deduction detected"}`.

### 4. `analytics_service/main.py`
Aggregates big data for the advocates.
*   **`@app.get("/city-medians")` route**: Queries Supabase for ALL earnings. It groups them by city (`city == 'Lahore'`, etc.) and calculates the median (middle value) hourly rate to show the "Real" minimum wage of that city.
*   **`@app.get("/platform-comparisons")` route**: Groups earnings by platform (Foodpanda vs Bykea) to see which company is paying the most across Pakistan.

---

## 🟢 PART 3: THE NODE.JS MICROSERVICES (Express)
**Location:** `/backend/services/`

### 1. `grievance_service/server.js`
The real-time community board.
*   **`app.post('/api/grievances')`**: Saves a new complaint text to the database.
*   **`app.get('/api/grievances')`**: Fetches all complaints. It includes a `JOIN` to fetch the comments attached to each complaint.
*   **`app.post('/api/grievances/:id/comments')`**: Takes a URL parameter `:id` to attach a reply to a specific grievance thread.

### 2. `certificate_renderer/index.js`
Generates the official income proofs.
*   **`app.get('/render/:userId')`**: 
    1. Takes the user ID from the URL.
    2. Fetches their verified earnings from Supabase.
    3. Uses an HTML string literal (template) to inject the worker's name, total earned in PKR, and a "Verified by FairGig" badge.
    4. Returns pure HTML that the browser can display or print as a PDF.

---

## 📜 PART 4: THE SCRIPTS & DATABASE AUTOMATION
**Location:** `/scripts`

### 1. `scripts/run_all.js`
The automation script that runs the whole project.
*   **`fs.readFileSync()`**: Opens your `backend/.env` file and reads the text.
*   **Regex Match `line.match()`**: Parses the text to find `POSTGRES_URL=...` and saves it into memory.
*   **`spawn()` function**: A built-in Node function that opens hidden terminal windows. It loops over the `services` array and spawns `python main.py` or `npm run dev` in the background, injecting the parsed environment variables into them.

### 2. `scripts/03_seed_pakistan_data.sql`
The database setup file.
*   **`INSERT INTO platform_configs`**: This SQL command hardcodes the names of Pakistani platforms (Foodpanda, Bykea, InDrive, Careem) into the database so the frontend dropdown menus populate correctly.
*   **`INSERT INTO earnings`**: Creates dummy data (fake shifts in PKR) so that when you present the dashboard to the judges, it isn't empty. It proves the graphs work.

---

## 🔒 PART 5: SECURITY & DEPLOYMENT FILES

### 1. `next.config.mjs`
*   **`turbopack: { root: __dirname }`**: This specific function tells the Next.js compiler to ONLY look inside the FairGig folder. We added this to fix a bug where Windows was trying to compile your entire `C:\Users\iqram` directory.

### 2. `package.json` & `pnpm-lock.yaml`
*   **`dependencies` object**: Lists every library used (like `recharts` for graphs, `lucide-react` for icons).
*   **The Lockfile**: The lockfile records the *exact millisecond version* of the library. If a library updates tomorrow and breaks its code, your project will still use the old working version, ensuring your presentation doesn't break.

### 3. `.gitignore`
*   **`node_modules/` rule**: Prevents the 1 Gigabyte folder of libraries from uploading to GitHub.
*   **`.env` rule**: Prevents your Supabase passwords from uploading. *This is the most critical function of this file.*
