# IMPORT STANDARD LIBRARIES
# Streamlit dashboard setup, OS env variable getters, and google-genai clients.
import os
import json
import logging
import streamlit as st
from google import genai
from google.genai import types

# Configure Logging for runtime error inspections
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# dotenv module load safely checking if installed (for local offline operations)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Streamlit Page scaling layout configuration setups
st.set_page_config(
    page_title="PromptPilot Companion",
    page_icon="🚀",
    layout="wide"
)

st.title("🚀 PromptPilot AI Companion")
st.caption("Portable Standalone Python Sandbox — Powered by Gemini 2.5/3.5")

# --------------------------------------------------------------------------
# Secure API Key Setup (System Environment check for GCP Cloud Run)
# --------------------------------------------------------------------------
api_key = os.environ.get("GEMINI_API_KEY", "")

client = None
if api_key:
    try:
        # Load modern SDK client matching Google GenAI specifications
        client = genai.Client(api_key=api_key)
    except Exception as e:
        logger.error(f"Error initializing Gemini client: {e}")
        st.error(f"Could not initialize Gemini Client: {e}")
else:
    st.info("💡 **Security Tip:** Run without credentials locally by setting `GEMINI_API_KEY` in your `.env` or system environment.")

# --------------------------------------------------------------------------
# Sidebar System Instructions Summary (Displays active prompting guidelines)
# --------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🛠️ Configured Prompting Rules")
    st.write("These default rules govern how your conversational objectives are refined into high-quality tutor prompts:")
    
    rules_brief = [
        ("Role Definition", "Act as a specialized subject tutor / coach."),
        ("Goal Focus", "Deliver clear step-by-step guidance."),
        ("Socratic Style", "Use interactive loops; prioritize questioning before answering."),
        ("Context Frame", "Enforce precise, student-friendly constraints."),
        ("Structure Outputs", "Produce clear markdown, practice sheets, and rubrics.")
    ]
    for title, desc in rules_brief:
        st.caption(f"🔹 **{title}**: {desc}")


# --------------------------------------------------------------------------
# Main Grid Form
# --------------------------------------------------------------------------
col_input, col_output = st.columns([5, 7])

with col_input:
    st.markdown("### 🎯 Your Learning Goal")
    
    presets = {
        "FastAPI in Roman Urdu": "Mujhy FastAPI Roman Urdu me seekhna hai starting stage se",
        "Python Beginners": "Mujhy Python seekhna hai, concepts clear hon and tasks milen",
        "SQL Joins Lesson": "Teach me SQL joins so I can build database tables and write queries",
    }
    
    selected_preset = st.selectbox("Select a preset intention or type below:", ["Custom Entry"] + list(presets.keys()))
    default_text = presets[selected_preset] if selected_preset in presets else "Ghar ka monthly budget seekhna hai basic formulas se"
    
    raw_text = st.text_area(
        "Describe what you want to learn (in mixed English/Urdu/Hindi):",
        value=default_text,
        height=120,
        placeholder="Type here..."
    )
    
    tutor_level = st.select_slider(
        "Learning Complexity:",
        options=["Beginner", "Intermediate", "Expert"],
        value="Intermediate"
    )
    
    generate_trigger = st.button("🚀 Refine Prompt", use_container_width=True, type="primary")

with col_output:
    st.markdown("### 📋 Refined Assistant Prompt")
    
    if generate_trigger and raw_text.strip():
        if not client:
            st.error("🔒 SECURE KEY REQUESTED: Setup a `GEMINI_API_KEY` to query live models.")
        else:
            with st.spinner("Generating refined prompt with Socratic boundaries..."):
                try:
                    system_instruction = """You are PromptPilot AI, an intelligent prompt generator, evaluator, and coach.
Your task is to analyze a student's raw intention (which is often messy, lacks details or is written in mixed Roman Urdu/English) and return a highly optimized prompt blueprint alongside a complete pedagogical evaluation.

You MUST analyze the input and extract:
1. The student's Goal, Topic, Skill Level (Beginner/Intermediate/Expert based on their request/selected mode), Output Type, Constraints, and any Missing Information.
2. An optimized, copy-ready prompt adhering to the 8 Hard-Coded Prompting Rules:
   - Rule 1: Clear Role ('Act as specialized field tutor/coach...')
   - Rule 2: Explicit Goal ('Your task is to guide step by step...')
   - Rule 3: Context ('Limit level bounds strictly...')
   - Rule 4: Constraints ('Avoid direct preambles or giving code output instantly...')
   - Rule 5: Output Structure ('Clean Markdown headers & clear assignments...')
   - Rule 6: Quality Criteria ('Clear concepts, error-free instructions...')
   - Rule 7: Iterative Loop (Revision instruction triggers)
   - Rule 8: Evaluation (A self-assessment grading scale rubric)
3. Quantitative comparison out of 10 for User Raw Intention vs. Generated Prompt.
4. Impact analysis on missing specifications.
5. Overall Pilot quality score out of 100."""

                    prompt_request = (
                        f"Student Intention: \"{raw_text}\"\n"
                        f"Selected Target Complexity: \"{tutor_level}\"\n\n"
                        "Return pure JSON schema with: goal, topic, skillLevel, outputType, constraints, "
                        "missingInformation (array), refinedPrompt, qualityScore, metrics, impacts, assignmentEvaluation"
                    )

                    response = client.models.generate_content(
                        model='gemini-3.5-flash',
                        contents=prompt_request,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            response_mime_type="application/json"
                        )
                    )

                    payload = json.loads(response.text)
                    st.success(f"✔️ Ready to Use! Refinement Score: {payload.get('qualityScore', 95)}/100")
                    
                    st.text_area("📋 Copy This Refined Prompt to Your Favorite Chatbot:", value=payload.get("refinedPrompt", ""), height=255)
                    
                    with st.expander("📊 Quality Metrics & Feedback Insights"):
                        metrics = payload.get("metrics", {})
                        st.write(f"Goal Clarity Improvement: {metrics.get('goalClarityUser', 3)}/10 ➡️ **{metrics.get('goalClarityGenerated', 10)}/10**")
                        st.write(f"Context Boundaries: {metrics.get('contextUser', 1)}/10 ➡️ **{metrics.get('contextGenerated', 10)}/10**")
                        
                        missing_info = payload.get("missingInformation", [])
                        if missing_info:
                            st.write("**Missing Parameters Resolved:**")
                            for val in missing_info:
                                st.write(f"⚠️ {val}")
                                
                except Exception as ex:
                    st.error(f"Failed to generate companion blueprint: {ex}")
    else:
        st.info("💡 Tap 'Refine Prompt' to execute comparative analysis.")
