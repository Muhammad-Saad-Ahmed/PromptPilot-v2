# 🚀 PromptPilot AI: Interactive Prompt Engineering Console

**PromptPilot** is a specialized full-stack application designed to transform messy, conversational, mixed Roman Urdu, English, or Hindi everyday intentions (Aam Shehri Masail) into structured, copy-ready, expert educational chatbot prompting blueprints.

It leverages Google's advanced **Gemini LLM Models** to analyze gaps, evaluate initial parameters, score prompt components, and run side-by-side simulations illustrating how specialized Socratic rules upgrade LLM coaching dynamics.

---

## 🎯 Core Engineering Features

1. **Intention Refinement Console**:
   - Converts natural language queries instantly.
   - Extracts key parameters: *Persona Mode*, *Topic Boundaries*, *Target Skill Levels*, and *Output Formats*.

2. **Interactive Rules Book Modal**:
   - Configures the **8 core pillars** of prompt engineering dynamically.
   - Allows users to append, edit, delete, or reset runtime instructions injected into the prompt generator in real-time.

3. **Evaluation & Loop Holes Report Card**:
   - Identifies specific instruction gaps (e.g., lack of cheating guidelines, missing grading criteria) and previews applied corrective solutions automatically.
   - Grades prompts based on creativity, practical utility, code logic friendliness, documentation, and structure out of 10.

4. **Side-by-Side Simulation Playground**:
   - Tests raw input vs. optimized prompt side-by-side using simultaneous live sandbox environment threads.

5. **Local Portability**:
   - Save copyable markdown files, export diagnostic report charts, or download a portable standalone python backend file directly from the console.

---

## 📁 Technical Directory Structure

```bash
├── server.ts               # Express.js Full-Stack Entry Server with Gemini APIs & static routing
├── app.py                  # Portable standalone Streamlit Dashboard companion
├── package.json            # Node.js project manifests & commands
├── tsconfig.json           # Declarative strict TypeScript compilation configs
├── vite.config.ts          # Vite frontend build setup with Tailwind CSS imports
├── PROJECT_REPORT.md       # Comprehensive architectural thesis on prompt structures
├── src/
│   ├── main.tsx            # React application entry point mounting
│   ├── App.tsx             # Parent Orchestrator Managing States, Storage, and Layout Views
│   ├── constants.ts        # Shared TypeScript data types, presets, and default prompt rules
│   ├── index.css           # Global custom styled Tailwind CSS & Google fonts importer
│   └── components/
│       ├── PresetSelector.tsx   # Popular Urdu trial presets selection cards grid
│       ├── RulesManager.tsx     # Active prompt-rules editor dashboard modal overlay
│       └── PromptSandbox.tsx    # Optimized prompts previewer, scorecard grids, and logs comparison
```

---

## ⚙️ Configuration & Hardware Setup

### 1. Prerequisites
Ensure you have the following installed on your developer machine:
- **Node.js** (v18 or higher recommended)
- **NPM** (v9 or higher)
- **Python** (v3.9 or higher, required only if running the Streamlit Python sandbox dashboard)

### 2. Environment Setup
Create a `.env` file at the root of the project (refer to `.env.example` as a layout benchmark) and append your secure API keys:

```env
# .env
GEMINI_API_KEY=your_actual_google_gemini_api_key_goes_here
```

---

## 🏃 Launch Guides

### 🌐 View Web Application (React + Express Stack)

#### Step 1: Install Node Dependencies
Open your developer console at the workspace root directory and execute:
```bash
npm install
```

#### Step 2: Boot Development Server
Run the unified full-stack dev server:
```bash
npm run dev
```
*The React + Express web server will load. Navigate to **http://localhost:3000** on your typical browser page.*

#### Step 3: Production Builds & Launches
To compile the site optimized for Cloud deployment execution:
```bash
# Formulates a production bundle for the client inside dist/ and compiles server.ts to CommonJS code
npm run build

# Start live production servers
npm start
```

---

### 🐍 Portable Standalone Python Dashboard (Streamlit Sandbox)

The app comes bundle-heavy with `app.py`, enabling offline terminal users to refine, generate, and copy Socratic expert instructions from their standard CLI setups.

#### Step 1: Setup Python Virtual Environment (Recommended)
```bash
# On Mac/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

#### Step 2: Install Libraries
Ensure you have the modern official Google GenAI packages alongside stream loaders installed:
```bash
pip install streamlit google-genai python-dotenv
```

#### Step 3: Set Secure API Key
```bash
# On Mac/Linux:
export GEMINI_API_KEY="your_actual_api_key"

# On Windows:
set GEMINI_API_KEY="your_actual_api_key"
```

#### Step 4: Streamlit Boot Operations
Initialize the local python client panel:
```bash
streamlit run app.py
```
*Your browser will trigger and load standard navigation at **http://localhost:8501***.

---

## 🎯 Educational Prompt Guidelines (8 Pillars)

PromptPilot enforces the following structured rules to unlock high-level guidance inside general consumer LLM chat utilities:
- **Roleplay Act**: Assigns professional personas matching study goals.
- **Dynamic Goals**: Specifies terminal instructional objectives.
- **Syllabus Bounds**: Prevents conversation drift or context bleed.
- **Socratic Restrictions**: Demands the chatbot to guide through interactive questioning/quizzes rather than outputting immediate answers.
- **Structured Outlay**: Custom Markdown headers and chapters layout benchmarks.
- **Success Scorecard**: Live self-assessment templates integrated with progress tests.

---

## 🛡️ License & Attributions
- Built as a modern AI tutoring sandbox powered by **Google Developer Studio Gemini APIs**.
- Interfaces powered by **Tailwind CSS**, **Framer Motion**, and **Lucide Icons** pairings.

*Happy Prompt Engineering!* 🚀
