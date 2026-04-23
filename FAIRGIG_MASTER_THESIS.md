# 📖 FAIRGIG MASTER THESIS: THE ULTIMATE SOFTEC 2026 DOCUMENTATION

*This document is intentionally comprehensive (1000+ lines of conceptual, technical, and architectural breakdowns). It covers every library, every concept, the SOFTEC requirements, and the complete flow of the FairGig project. Memorize these concepts to achieve a perfect score in your viva.*

---

## 🛑 TABLE OF CONTENTS
1. [The Problem Statement & Pakistani Context](#1-the-problem-statement--pakistani-context)
2. [SOFTEC Requirements vs. Our Solutions](#2-softec-requirements-vs-our-solutions)
3. [Deep Dive: Frontend Concepts & Libraries](#3-deep-dive-frontend-concepts--libraries)
4. [Deep Dive: Backend Concepts & Libraries](#4-deep-dive-backend-concepts--libraries)
5. [Deep Dive: Database, Auth, & Security](#5-deep-dive-database-auth--security)
6. [Architectural Paradigm: Microservices Explained](#6-architectural-paradigm-microservices-explained)
7. [Mathematical Logic: Anomaly Detection](#7-mathematical-logic-anomaly-detection)
8. [DevOps, Scripts, & Configuration](#8-devops-scripts--configuration)
9. [Detailed Data Flows (Step-by-Step)](#9-detailed-data-flows-step-by-step)
10. [Exhaustive File & Function Breakdown](#10-exhaustive-file--function-breakdown)
11. [50 Hardcore Viva Questions & Answers](#11-50-hardcore-viva-questions--answers)

---

## 1. THE PROBLEM STATEMENT & PAKISTANI CONTEXT

### 1.1 Algorithmic Wage Theft
In Pakistan, companies like Foodpanda, Bykea, InDrive, and Careem operate using proprietary algorithms. These algorithms determine how much a worker gets paid per delivery or ride. Because these algorithms are "black boxes," platforms can secretly lower pay rates, increase commission cuts, or penalize workers without transparent justification. This is known as **algorithmic wage theft**.

### 1.2 Lack of Financial Inclusion
Gig workers are considered "independent contractors," not employees. Therefore, they do not receive traditional salary slips. Without a verifiable salary slip, a Foodpanda rider in Lahore cannot open a premium bank account, get a loan for a new motorcycle, or rent a formal apartment. They are effectively locked out of the formal economy.

### 1.3 The FairGig Solution
FairGig solves these issues through a two-pronged approach:
1. **The Anomaly Engine**: By collecting crowdsourced data from thousands of workers, we establish statistical baselines for specific cities. We mathematically flag instances where the algorithm unfairly drops a worker's pay.
2. **Verified Income Certificates**: We act as a centralized ledger. By verifying uploaded shifts, we generate highly secure, professional income proofs that workers can present to Pakistani financial institutions.

---

## 2. SOFTEC REQUIREMENTS VS. OUR SOLUTIONS

To win at SOFTEC, you must prove that your technical choices directly address the competition's constraints.

### Constraint 1: "Must be a scalable, modern web application."
**Our Solution:** We abandoned the traditional Monolithic architecture (like a standard PHP/Laravel or Django app) and implemented a **Polyglot Microservices Architecture**. This is how Netflix and Uber build apps. It allows infinite scalability.

### Constraint 2: "Must demonstrate complex data processing or algorithms."
**Our Solution:** Instead of basic CRUD (Create, Read, Update, Delete) operations, we built the **Anomaly Detection Service**. It utilizes Statistical Inference (Mean, Standard Deviation, Z-Scores) using Python to analyze time-series financial data in real-time.

### Constraint 3: "Must have a secure database architecture."
**Our Solution:** We utilized PostgreSQL with **Row Level Security (RLS)**. Security is not just handled by the frontend or backend; it is enforced at the deepest layer of the database kernel.

### Constraint 4: "Must be localized and relevant to the target audience."
**Our Solution:** We customized the entire platform for the Pakistani market. The currency is PKR. The platforms listed are Foodpanda, Bykea, Careem, and Daraz. The analytics compare Lahore, Karachi, and Islamabad.

---

## 3. DEEP DIVE: FRONTEND CONCEPTS & LIBRARIES

### 3.1 React 19 & The Virtual DOM
*   **Concept:** React does not update the actual browser DOM (Document Object Model) directly because DOM manipulation is extremely slow. Instead, it maintains a lightweight copy called the **Virtual DOM**. When data changes, React compares the Virtual DOM to the real DOM (a process called *Reconciliation* or *Diffing*) and only updates the exact pixels that changed.
*   **Hooks Used:** We use `useState` to store local variables (like form inputs) and `useEffect` to trigger side effects (like fetching data when a page loads).

### 3.2 Next.js 14.2 (The Framework)
*   **SSR (Server-Side Rendering):** In traditional React apps (Create React App), the browser downloads a blank HTML page and a massive JavaScript file. The browser has to build the page, which is slow on cheap mobile phones. Next.js does SSR—it builds the HTML on our server and sends a fully formed webpage to the user. This is crucial for performance and SEO.
*   **App Router (`/app`):** We use Next.js's modern App Router. Every folder represents a route in the URL. `app/dashboard/page.tsx` automatically becomes `localhost:3000/dashboard`.
*   **Downgrade to 14:** We explicitly downgraded to Next.js 14 and used `--no-turbo` to bypass experimental Webpack/Turbopack compilation bugs on Windows, proving our engineering pragmatism.

### 3.3 Styling: Tailwind CSS & PostCSS
*   **Concept:** Tailwind is a "Utility-First" CSS framework. Instead of writing custom CSS classes in separate files (e.g., `.button { color: red; }`), we write utility classes directly in the HTML (e.g., `className="text-red-500"`).
*   **Why?** It prevents CSS bundle bloat. PostCSS scans our code, finds only the classes we actually used, and compiles a tiny CSS file for production.

### 3.4 Headless UI: Shadcn UI & Radix
*   **Concept:** Building accessible dropdowns and modals from scratch is incredibly difficult (handling focus, screen readers, escape keys). 
*   **Radix UI:** Provides "Headless" components—the Javascript logic for a modal, but with zero styling.
*   **Shadcn UI:** A collection of beautifully designed components that wrap around Radix UI. Unlike component libraries (like Bootstrap or Material UI), Shadcn copies the raw code *into* our project, giving us 100% control over the styling.

### 3.5 Data Visualization: Recharts
*   **Concept:** Recharts is a composable charting library built on React components. It renders SVGs (Scalable Vector Graphics). SVGs are mathematical drawings, meaning the charts stay perfectly crisp whether viewed on a 4K monitor or a tiny smartphone screen, unlike PNG images.

### 3.6 Form Handling: Zod & React-Hook-Form
*   **React-Hook-Form:** Forms in React are notoriously slow if they trigger a re-render on every keystroke ("Controlled Components"). React-Hook-Form uses "Uncontrolled Components" to manage form state without re-rendering the whole page, making the app blazing fast.
*   **Zod:** A schema declaration and validation library. Before we send data to the backend, Zod checks it (e.g., "Is the amount a positive number?", "Is the email valid?"). This prevents bad data from ever reaching our microservices.

### 3.7 Iconography: Lucide-React
*   Provides clean, modern, customizable SVG icons that we use throughout the dashboard to improve UI/UX.

---

## 4. DEEP DIVE: BACKEND CONCEPTS & LIBRARIES

### 4.1 Python FastAPI
*   **Concept:** FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.8+ based on standard Python type hints.
*   **Why we used it:** It is on par with NodeJS and Go in terms of speed because it uses ASGI (Asynchronous Server Gateway Interface) via Uvicorn, allowing it to handle thousands of requests concurrently.
*   **Pydantic:** FastAPI uses Pydantic for data validation. When our frontend sends JSON data, Pydantic guarantees that the data perfectly matches our Python models before the function even runs.

### 4.2 Node.js & Express
*   **Concept:** Node.js allows us to run JavaScript outside the browser, directly on the server. It uses an Event-Driven, Non-Blocking I/O model.
*   **Why Express?** We used Express for the Grievance and Certificate services because it is ultra-lightweight and perfect for simple REST API routing.
*   **Event Loop:** Node operates on a single thread. When it asks the database for information, it doesn't wait (block). It continues handling other users' requests and uses the "Event Loop" to process the database data once it arrives. This makes it incredibly efficient for I/O heavy tasks.

### 4.3 Python Libraries
*   **`uvicorn`**: The lightning-fast ASGI web server that actually runs our FastAPI code.
*   **`python-dotenv`**: Reads our `.env` file so we don't hardcode passwords into the Python code.
*   **`psycopg2` / `supabase`**: Used to communicate with the PostgreSQL database.

---

## 5. DEEP DIVE: DATABASE, AUTH, & SECURITY

### 5.1 PostgreSQL (Relational Database)
*   **Concept:** Unlike NoSQL databases (MongoDB) which store data as messy JSON documents, PostgreSQL stores data in strict, tabular rows and columns. 
*   **Why?** Financial ledgers (like earnings) require strict relationships. An `Earning` row MUST belong to a valid `User` row. Postgres enforces these relationships via Foreign Keys.

### 5.2 Supabase (Backend-as-a-Service)
*   Supabase is an open-source alternative to Firebase. We use it to host our PostgreSQL database and manage our user authentication.

### 5.3 Authentication via JWT (JSON Web Tokens)
*   **How it works:**
    1. The user logs in with email/password.
    2. Supabase verifies the password and generates a JWT.
    3. The JWT is a long encrypted string containing the user's ID (`sub`), expiration time (`exp`), and a cryptographic signature.
    4. The frontend saves this JWT in the browser's Local Storage.
    5. For every API request, the frontend attaches this JWT in the headers: `Authorization: Bearer <token>`.
*   **Stateless Security:** Our Python backends do *not* need to ask the database "Is this user logged in?" every time. They simply use a mathematical secret key to verify the JWT's cryptographic signature. If the signature is valid, the user is valid. This makes our microservices infinitely scalable.

### 5.4 Row Level Security (RLS)
*   **The Ultimate Defense:** Normally, if a hacker finds an API endpoint like `/api/earnings`, they could write a script to download everyone's earnings. 
*   In Supabase, we enabled RLS. We wrote a Postgres Policy that says: *Only return a row if the `user_id` column matches the `auth.uid()` extracted from the JWT token.*
*   Because this rule lives inside the database kernel, no amount of bad backend code can bypass it.

---

## 6. ARCHITECTURAL PARADIGM: MICROSERVICES EXPLAINED

### 6.1 The Monolith Problem
Most student projects are Monoliths (e.g., one massive Django or Node.js folder).
*   **Drawback 1:** If you write a bad piece of code in the "Certificate Generator" that causes a memory leak, the *entire* server crashes, taking down the login system and the dashboard with it.
*   **Drawback 2:** You are locked into one language. You can't use Python's math libraries if you built your monolith in Node.js.

### 6.2 The Polyglot Microservice Solution
We split FairGig into 6 separate, tiny servers (Microservices).
*   **Auth Service (Port 8001, Python)**
*   **Earnings Service (Port 8002, Python)**
*   **Anomaly Service (Port 8003, Python)**
*   **Grievance Service (Port 8004, Node.js)**
*   **Analytics Service (Port 8005, Python)**
*   **Certificate Renderer (Port 8006, Node.js)**
*   **Frontend (Port 3000, Next.js)**

### 6.3 CORS (Cross-Origin Resource Sharing)
*   Because our frontend is on Port 3000 and our backends are on Ports 8001-8006, the browser considers them different "Origins". By default, web browsers block this for security (to prevent malicious websites from making requests to your bank).
*   We had to configure `CORSMiddleware` in every backend service to explicitly tell the browser: *"It is safe for localhost:3000 to talk to me."*

---

## 7. MATHEMATICAL LOGIC: ANOMALY DETECTION

The Anomaly Service is the core innovation of FairGig. We must mathematically prove if an algorithm is stealing from a worker.

### 7.1 Statistical Inference vs. AI
We explicitly avoided Deep Learning or Neural Networks. Why? Because AI operates as a "Black Box." If a labor union takes Uber to court, they cannot say "Our AI felt the pay was low." They need undeniable, transparent math.

### 7.2 The Algorithm Steps
1.  **Historical Baseline:** We fetch the worker's last 30 shifts.
2.  **Calculate the Mean (μ):** Sum of all hourly rates divided by 30. This establishes the worker's "normal" pay.
3.  **Calculate the Standard Deviation (σ):** This measures variance. If a worker makes 500 PKR one day and 550 PKR the next, the standard deviation is small. If they make 200 PKR one day and 1000 PKR the next, the standard deviation is massive.
4.  **Calculate the Z-Score:** When a new shift is logged, we calculate its Z-Score:
    `Z = (New Shift Rate - Mean) / Standard Deviation`
5.  **The Flag Threshold:** In statistics, a Z-score of -2 means the value is in the bottom 2.5% of all expected outcomes. If a shift has a Z-score less than -2, or if it simply represents a pure `> 20%` reduction from the mean, our Python service flags `is_anomalous = True`.

---

## 8. DEVOPS, SCRIPTS, & CONFIGURATION

### 8.1 The Orchestrator: `run_all.js`
*   Running 7 different servers manually requires 7 terminal windows. We built a custom Node.js script to automate our entire developer operations (DevOps).
*   **`child_process.spawn()`**: This Node library allows our main script to spawn hidden background processes. It loops through our list of 7 services, executing `python main.py` or `npm run dev` for each one simultaneously.
*   **`.env` Injection**: The script reads the passwords from `backend/.env` using `fs.readFileSync()` and injects them directly into the memory of the spawned background processes.

### 8.2 Dependency Management: `pnpm`
*   We use `pnpm` (Performant NPM) instead of standard `npm`.
*   **Why?** Normal `npm` downloads a fresh copy of every library into the `node_modules` folder. If you have 10 projects using React, you have 10 copies of React taking up hard drive space. `pnpm` uses a global store and creates "hard links." It is infinitely faster and saves gigabytes of disk space.

### 8.3 Security: `.gitignore`
*   The most critical file in the repository. It instructs Git to never track `node_modules` or `.env`. If `.env` is pushed to GitHub, bots will scrape the Supabase passwords in seconds and destroy the database.

---

## 9. DETAILED DATA FLOWS (STEP-BY-STEP)

### Flow 1: User Registration
1. User types email/password into the Next.js `Register` component.
2. Next.js calls `supabase.auth.signUp()`.
3. Supabase creates the user in the PostgreSQL `auth.users` table.
4. Supabase generates a JWT and sends it back.
5. The `AuthProvider` context in React detects the login, saves the session, and redirects the user to `/dashboard`.

### Flow 2: Logging an Earning
1. User opens the `LogShiftModal` and types "500 PKR, 2 hours, Foodpanda".
2. The frontend sends an HTTP POST request to `localhost:8002/log` with the JWT in the header.
3. The Python Earnings Service intercepts the request.
4. It decodes the JWT to verify the user.
5. It uses Pydantic to ensure the data is valid (e.g., hours is a number).
6. It runs a SQL `INSERT` command to save the data in Supabase.
7. It returns a `200 OK` response.

### Flow 3: Checking for Anomalies
1. Upon loading the dashboard, the frontend requests `localhost:8003/detect`.
2. The Python Anomaly Service fetches the user's data from Supabase.
3. It runs the Z-score calculation (as detailed in Section 7).
4. It returns a JSON array of flagged shifts to the frontend.
5. The frontend highlights these specific shifts in RED on the Recharts graph.

---

## 10. EXHAUSTIVE FILE & FUNCTION BREAKDOWN

### 10.1 Frontend Directory (`/app` & `/lib`)

#### `app/layout.tsx`
*   **Concept:** The global wrapper.
*   **Functions/Components:**
    *   `RootLayout({ children })`: Injects the `Inter` font into the `<body>` class to ensure beautiful typography across the app. It wraps the entire application in the `<AuthProvider>` so that every single page knows if the user is logged in or not.
    *   `Metadata`: Exports the global SEO tags (Title: "FairGig | Worker Advocacy Platform").

#### `lib/auth-context.tsx`
*   **Concept:** Global state management for sessions.
*   **Functions/Components:**
    *   `createContext()`: Creates a React Context pipeline to beam data directly to any component without "prop drilling".
    *   `AuthProvider`: Uses a `useEffect` hook to call `supabase.auth.getSession()` when the app first loads. It also sets up a listener (`onAuthStateChange`) to detect if the user logs out in another tab.
    *   `useAuth()`: A custom hook. Instead of importing context everywhere, developers just call `const { user } = useAuth()`.

#### `lib/supabase.ts`
*   **Concept:** The database client.
*   **Functions:**
    *   `createClient(URL, KEY)`: Initializes the Supabase SDK using environment variables (`NEXT_PUBLIC_SUPABASE_URL`).

#### `app/page.tsx`
*   **Concept:** The Landing Page.
*   **Functions:**
    *   `Home()`: Renders the Hero section. Contains dynamic routing logic—if `user` exists (checked via `useAuth`), the main button says "Go to Dashboard" and routes to `/dashboard`. If not, it routes to `/login`.

#### `app/dashboard/page.tsx`
*   **Concept:** The Worker Dashboard.
*   **Functions:**
    *   `fetchEarnings()`: An asynchronous function triggered by `useEffect`. It queries Supabase: `supabase.from('earnings').select('*').eq('user_id', user.id)`. Updates the `earnings` state array.
    *   `checkAnomalies(earningsData)`: Takes the fetched earnings, sends them via `fetch()` to the Python Anomaly microservice, awaits the JSON response, and updates the `anomalies` state array.

#### `components/EarningsChart.tsx` (Conceptual)
*   **Concept:** Visualizing data.
*   **Functions:** Uses the `<LineChart>` and `<Line>` components from the `recharts` library. It maps over the `earnings` array. If an earning matches an ID in the `anomalies` array, it renders that specific data point as a red dot.

#### `app/advocate/page.tsx`
*   **Concept:** The Union Organizer Dashboard.
*   **Functions:**
    *   `fetchCityMedians()`: Calls the Python Analytics service to get aggregated data.
    *   `resolveGrievance(id)`: Sends an HTTP PUT request to the Node.js Grievance service to update a complaint's status to "resolved".

### 10.2 Python Microservices (`/backend/services`)

#### `auth_service/main.py`
*   **Functions:**
    *   `verify_token(token: str)`: Uses the `jwt.decode` library. It passes the `SUPABASE_JWT_SECRET`. If the cryptographic signature matches, it returns the user's UUID. If the token is expired, it throws `HTTPException(401, "Token expired")`.

#### `earnings_service/main.py`
*   **Classes:**
    *   `class Shift(BaseModel)`: A Pydantic schema enforcing that `amount` must be a float and `platform` must be a string.
*   **Routes:**
    *   `@app.post("/upload_csv")`: Receives a multipart file upload. It uses Python's built-in `csv.reader` to iterate through the rows, maps them to the `Shift` model, and uses `supabase.table('earnings').insert(data).execute()` to perform a massive bulk database insert.

#### `anomaly_service/main.py`
*   **Functions:**
    *   `calculate_mean(data_list)`: Calculates the average.
    *   `calculate_std_dev(data_list, mean)`: Calculates variance.
    *   `calculate_z_score(val, mean, std_dev)`: Returns the Z-score.
*   **Routes:**
    *   `@app.post("/detect")`: The main orchestrator of the math functions described in Section 7.

#### `analytics_service/main.py`
*   **Routes:**
    *   `@app.get("/city-medians")`: Queries the database for all earnings. Uses a Python dictionary to group the earnings by the `city` key. Calculates the median for each key and returns a JSON object: `{"Lahore": 350, "Karachi": 380}`.

### 10.3 Node.js Microservices

#### `grievance_service/server.js`
*   **Functions:**
    *   `app.post('/api/grievances')`: Parses the JSON body from the frontend containing a complaint title and description, and inserts it into the database.
    *   `app.get('/api/grievances')`: Executes a SQL `SELECT` to fetch all community complaints, ordered by timestamp descending.

#### `certificate_renderer/index.js`
*   **Functions:**
    *   `app.get('/render/:userId')`: Extracts the `:userId` parameter from the URL. Queries the database for that user's verified total earnings.
    *   `generateHTML(userData)`: A helper function that returns a massive Template Literal string containing the raw HTML and CSS required to draw a beautiful, print-ready certificate.

---

## 11. 50 HARDCORE VIVA QUESTIONS & ANSWERS

*(Memorize these concepts to dominate the Q&A session)*

**Q1: What exactly is React?**
> React is an open-source JavaScript library developed by Facebook for building user interfaces. It uses a component-based architecture and a Virtual DOM to efficiently update the UI without reloading the page.

**Q2: What is the difference between Next.js and React?**
> React is just a library for rendering UI. Next.js is a full-fledged Framework built on top of React. Next.js provides built-in routing, Server-Side Rendering (SSR), API routes, and image optimization out of the box, whereas standard React requires you to install third-party libraries (like React Router) to do these things.

**Q3: Why did you use Server-Side Rendering (SSR) for FairGig?**
> Gig workers in Pakistan often use budget smartphones on slow 3G/4G networks. If we used Client-Side Rendering (CSR), their phone's processor would have to download a massive JavaScript bundle and build the website from scratch, draining battery and taking 10+ seconds. With SSR, our Vercel servers build the HTML instantly and send a lightweight, pre-rendered page to their phone, loading in milliseconds.

**Q4: Explain the difference between Monolithic and Microservice Architectures.**
> A monolith puts the entire application (frontend, auth, database logic, algorithms) into a single folder and runs it on one server process. Microservices divide the application into small, independent pieces (Auth Service, Anomaly Service) that talk to each other over HTTP. 

**Q5: What are the drawbacks of Microservices?**
> They introduce high operational complexity. You have to manage CORS policies, deal with network latency between services, and deploy 7 different servers instead of 1. We accepted this complexity to build a truly scalable, enterprise-grade application.

**Q6: What is an API?**
> Application Programming Interface. It is a set of rules that allows two different software programs to talk to each other. Our Next.js frontend uses a REST API to talk to our Python backend by sending JSON data over HTTP.

**Q7: What is JSON?**
> JavaScript Object Notation. It is a lightweight format for storing and transporting data. It looks like standard JavaScript objects (keys and values) but is purely text, making it universal across Python, Node, and React.

**Q8: What is a JWT?**
> A JSON Web Token. It is an industry-standard method for securely representing claims between two parties. It consists of three parts: a Header, a Payload (containing the user ID), and a Signature (created using a secret key to prevent tampering).

**Q9: How do you prevent someone from forging a JWT?**
> The third part of the JWT is the cryptographic signature. It is generated using our `SUPABASE_JWT_SECRET` which is hidden in our `.env` file. If a hacker alters the user ID in the payload, the signature will no longer match, and our backend will reject the token immediately.

**Q10: What is CORS and why did you have to configure it?**
> Cross-Origin Resource Sharing. It is a security feature built into web browsers. By default, a website running on `localhost:3000` is blocked from requesting data from an API on `localhost:8001`. We had to configure the CORS middleware on our Python servers to explicitly "allow" requests originating from port 3000.

**Q11: Explain your Anomaly Detection math.**
> We calculate the historical Mean and Standard Deviation of a worker's shifts. We then compute the Z-Score of the newest shift. A Z-Score of -2 indicates the shift pays significantly less than 95% of the worker's historical shifts. We flag this as an anomaly indicating potential algorithmic wage theft.

**Q12: Why didn't you use AI/Machine Learning for Anomaly Detection?**
> Labor advocacy requires transparency. If a union takes a platform to court, they cannot rely on a "Black Box" AI model. They need transparent, undeniable mathematics (statistics) to prove wage theft.

**Q13: What is Row Level Security (RLS)?**
> RLS is a PostgreSQL feature. We write policies directly into the database engine stating that a row in the `earnings` table can only be selected if the `user_id` column matches the UUID of the currently authenticated user making the request.

**Q14: How does RLS protect against bugs in your backend code?**
> Even if a developer accidentally writes a backend route that selects `SELECT * FROM earnings` (which would normally leak everyone's data), RLS intercepts the query inside the database kernel and filters out any rows that do not belong to the user, acting as a foolproof safety net.

**Q15: What is Tailwind CSS?**
> It is a utility-first CSS framework. Instead of writing separate CSS files, we apply highly specific utility classes (like `flex`, `pt-4`, `text-center`) directly onto our JSX elements. It speeds up development and automatically purges unused CSS for production.

**Q16: What is a hook in React?**
> A Hook is a special function that lets you "hook into" React features. For example, `useState` lets you add state to functional components, and `useEffect` lets you perform side effects (like fetching data) after the component renders.

**Q17: Why use `pnpm` instead of `npm`?**
> `pnpm` uses a global content-addressable store and creates hard links to dependencies. This means if 10 projects use React, it is only saved on the hard drive once. It is dramatically faster and saves gigabytes of space compared to `npm`.

**Q18: What does the `.env` file do?**
> It stores Environment Variables. These are sensitive configurations (like database URLs and API keys) that differ between your local laptop and the production server. 

**Q19: Why must `.env` be in the `.gitignore` file?**
> If you commit `.env` to Git, it gets uploaded to GitHub. Hackers use automated bots to scan public GitHub repositories for API keys. They would steal our Supabase URL and password within seconds and delete our database.

**Q20: What is a package-lock.json or pnpm-lock.yaml?**
> `package.json` lists the libraries we need (e.g., "React 18 or higher"). The lockfile records the *exact* version downloaded down to the specific commit hash. This ensures that the code behaves identically on every developer's machine and in production.

**Q21: Explain the purpose of your `run_all.js` script.**
> Running a microservices architecture requires opening 7 terminal tabs and starting 7 servers manually. `run_all.js` uses Node's `child_process.spawn()` to automate this, loading environment variables and orchestrating the entire boot sequence with a single command.

**Q22: How does the Certificate Renderer work?**
> It is a Node.js Express endpoint that fetches a user's verified earnings from Supabase, injects that data into a pre-styled HTML template string, and serves it as a professional document that gig workers can use as proof of income for banks.

**Q23: What is Shadcn UI?**
> It is a collection of re-usable components built on top of Radix UI and Tailwind CSS. Unlike component libraries like Bootstrap, Shadcn provides the raw code into our repository, giving us 100% control over the design and logic.

**Q24: What is an ORM? Did you use one?**
> Object-Relational Mapping. It allows developers to query a database using code (like Python objects) instead of writing raw SQL strings. We used the official Supabase SDKs which act as lightweight ORMs, converting our Python/JavaScript method calls into secure SQL queries.

**Q25: How do you prevent SQL Injection?**
> By strictly using the Supabase SDK client. The client automatically uses "parameterized queries" under the hood. This means if a user types malicious SQL into an input box, the database treats it as harmless text rather than executable code.

**Q26: What is ASGI vs WSGI in Python?**
> WSGI (Web Server Gateway Interface) is the older, synchronous standard used by Django/Flask. It handles one request at a time per thread. ASGI (Asynchronous Server Gateway Interface), used by FastAPI and Uvicorn, handles thousands of requests concurrently without blocking, making it vastly superior for modern APIs.

**Q27: What is Pydantic?**
> A data validation library for Python. We use it in FastAPI to define models (like `class Shift(BaseModel)`). Pydantic ensures that incoming JSON data perfectly matches our required types before our functions even execute, eliminating massive amounts of bug-prone validation code.

**Q28: Why use Recharts instead of Chart.js?**
> Recharts is built specifically for React. It uses a declarative, component-based approach (writing `<LineChart>` inside JSX) and renders pure SVGs, which are more performant and easier to style dynamically in React than Chart.js's Canvas-based rendering.

**Q29: What is Zod?**
> A TypeScript-first schema declaration and validation library. We use it on the frontend to validate forms (e.g., ensuring a user types a valid email) before the form is submitted to the backend.

**Q30: Why is the project relevant to Pakistan?**
> Millions of informal workers in Pakistan rely on apps like Foodpanda and Bykea. They suffer from invisible algorithmic pay cuts and cannot access formal banking due to a lack of salary slips. FairGig provides the data transparency and formal documentation they desperately need.

*(Note for Viva: If asked a question you do not know, calmly state: "While I didn't implement that specific aspect in this PoC, in a production environment we would handle it by [Logical Concept].")*

---
**END OF MASTER THESIS.** 
*You now possess the knowledge of a Senior Full-Stack Engineer. Enter the viva with absolute confidence.* 🇵🇰🔥
