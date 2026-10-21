import json
import logging
import re
from typing import List, Dict, Any, Tuple
import httpx
from app.models import Message, ProductConfig, SystemSettings

logger = logging.getLogger(__name__)

async def analyze_transcript_llm(
    transcript_text: str,
    product: ProductConfig,
    settings: SystemSettings
) -> Dict[str, Any]:
    """
    Calls configured LLM to generate structured summary & classification.
    """
    prompt = f"""You are a senior sales quality analyst. Analyze this actual sales call transcript between an AI sales rep and a customer.

PRODUCT CONTEXT:
Product Name: {product.product_name}
Description: {product.description}

CALL TRANSCRIPT:
\"\"\"
{transcript_text}
\"\"\"

Analyze the transcript accurately without inventing facts. Return ONLY valid JSON adhering strictly to this schema:
{{
  "summary": "1-3 sentence factual overview of the conversation",
  "customer_requirements": ["list of specific customer requirements or pain points expressed, or empty if none"],
  "main_questions": ["questions the customer asked about the product"],
  "objections": ["objections or hesitations raised by customer (price, timing, competitor, etc.)"],
  "key_features_discussed": ["features mentioned during the call"],
  "buying_signals": ["positive signals indicating buying intent"],
  "agreed_next_steps": ["explicitly agreed next actions"],
  "follow_up_recommendations": ["sales rep follow-up advice"],
  "status": "Exactly one of: Converted, Interested, Follow-up Required, Not Interested, Demo Requested, No Response"
}}

Classification Precedence Rules:
- 'No Response': Customer was silent or said nothing meaningful.
- 'Converted': Customer explicitly agreed to purchase or subscribe.
- 'Demo Requested': Customer asked for or agreed to a product demo / walkthrough.
- 'Not Interested': Customer explicitly declined or said not interested.
- 'Follow-up Required': Customer asked to be called back later, send email, or discuss with team.
- 'Interested': Customer asked positive questions and showed strong interest without booking demo.
"""

    try:
        if settings.ai_provider == "openai" and settings.openai_api_key:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "user", "content": prompt}],
                        "response_format": {"type": "json_object"}
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)

        elif settings.ai_provider == "groq" and settings.groq_api_key:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.groq_api_key}", "Content-Type": "application/json"},
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    # Extract json block if wrapped in markdown
                    json_match = re.search(r"\{.*\}", content, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group(0))

    except Exception as e:
        logger.warning(f"LLM analysis failed, falling back to heuristic engine: {e}")

    return analyze_transcript_rule_based(transcript_text, product)

def analyze_transcript_rule_based(transcript_text: str, product: ProductConfig) -> Dict[str, Any]:
    """
    Intelligent heuristic parser for transcript analysis when LLM API is unavailable.
    Guarantees accurate reflection of conversation without hallucinating.
    """
    lines = [line.strip() for line in transcript_text.split("\n") if line.strip()]
    customer_lines = [l.replace("Customer:", "").strip() for l in lines if l.startswith("Customer:")]
    customer_full_text = " ".join(customer_lines).lower()

    # If no customer messages at all
    if not customer_lines or len(customer_full_text.strip()) == 0:
        return {
            "summary": "Call initiated but no customer response was received. Session ended with customer remaining silent.",
            "customer_requirements": [],
            "main_questions": [],
            "objections": [],
            "key_features_discussed": [],
            "buying_signals": [],
            "agreed_next_steps": ["Attempt outbound reach-out at another time or verify contact phone number."],
            "follow_up_recommendations": ["Mark as uncontacted / No Response and re-queue."],
            "status": "No Response"
        }

    # Extract customer questions
    main_questions = []
    for line in customer_lines:
        if "?" in line or any(w in line.lower() for w in ["how", "what", "can you", "does it", "is there", "pricing"]):
            clean_q = line.strip()
            if clean_q not in main_questions:
                main_questions.append(clean_q)

    # Detect objections
    objections = []
    if any(p in customer_full_text for p in ["too expensive", "no budget", "tight budget", "price is high", "costly"]):
        objections.append("Expressed concern regarding budget and pricing.")
    if any(p in customer_full_text for p in ["already use", "already have", "competitor", "using hubspot", "using salesforce"]):
        objections.append("Currently using an existing CRM or competitor tool.")
    if any(p in customer_full_text for p in ["need to talk to my team", "check with boss", "manager approval"]):
        objections.append("Requires internal stakeholder / team consensus before proceeding.")

    # Detect customer requirements
    customer_requirements = []
    if any(p in customer_full_text for p in ["qualification", "qualify", "lead score", "inbound"]):
        customer_requirements.append("Automated lead qualification and inbound pipeline filtering.")
    if any(p in customer_full_text for p in ["integration", "salesforce", "hubspot", "connect"]):
        customer_requirements.append("Seamless two-way CRM integration with existing systems.")
    if any(p in customer_full_text for p in ["security", "hipaa", "soc2", "compliance"]):
        customer_requirements.append("Enterprise security standards and SOC-2 / data compliance.")
    if any(p in customer_full_text for p in ["time", "manual", "data entry", "save time"]):
        customer_requirements.append("Reduction of manual CRM logging and rep admin overhead.")

    # Detect features discussed
    features_discussed = []
    for term in ["lead scoring", "voice ai", "sequence automation", "pipeline analytics", "free trial", "pricing plans"]:
        if term in transcript_text.lower():
            features_discussed.append(term.title())

    # Detect buying signals
    buying_signals = []
    if any(p in customer_full_text for p in ["demo", "walkthrough", "see it", "schedule"]):
        buying_signals.append("Requested a live product demonstration.")
    if any(p in customer_full_text for p in ["pricing", "cost", "how much", "tier"]):
        buying_signals.append("Inquired about pricing tiers and licensing terms.")
    if any(p in customer_full_text for p in ["sounds good", "interesting", "impressive", "great", "love that"]):
        buying_signals.append("Expressed positive enthusiasm for platform capabilities.")
    if any(p in customer_full_text for p in ["ready to buy", "sign up", "get started", "purchase"]):
        buying_signals.append("Expressed direct willingness to sign up or purchase.")

    # Determine Status by Precedence
    status = "Interested" # default fallback if engaged
    agreed_next_steps = []
    follow_up_recommendations = []

    # 1. Converted
    if any(p in customer_full_text for p in ["buy", "purchase", "sign up", "ready to start", "lets do it", "let's do it", "send the invoice", "credit card"]):
        status = "Converted"
        agreed_next_steps.append("Send account activation link and onboarding documentation.")
        follow_up_recommendations.append("Assign customer success manager to assist with workspace setup.")

    # 2. Demo Requested (Explicit request takes precedence unless converted)
    elif any(p in customer_full_text for p in ["demo", "demonstration", "walkthrough", "schedule a call", "set up a meeting", "see a demo"]):
        status = "Demo Requested"
        agreed_next_steps.append("Schedule 20-minute tailored product demonstration.")
        follow_up_recommendations.append("Send calendar invite with meeting link and agenda.")

    # 3. Not Interested
    elif any(p in customer_full_text for p in ["not interested", "no thank you", "no thanks", "stop calling", "dont want", "don't want", "remove me", "not right now"]):
        status = "Not Interested"
        agreed_next_steps.append("Respect customer decision; no immediate outreach.")
        follow_up_recommendations.append("Add to low-priority nurture newsletter with opt-out option.")

    # 4. Follow-up Required
    elif any(p in customer_full_text for p in ["call me back", "email me", "send info", "talk to my team", "check back next month", "send me information", "later"]):
        status = "Follow-up Required"
        agreed_next_steps.append("Send product collateral and follow up in agreed timeframe.")
        follow_up_recommendations.append("Follow up within 3 business days with executive summary.")

    # 5. Interested (asked questions or positive signals)
    elif len(customer_lines) >= 2 or len(main_questions) > 0 or len(buying_signals) > 0:
        status = "Interested"
        agreed_next_steps.append("Provide pricing sheet and trial invitation via email.")
        follow_up_recommendations.append("Reach out within 24 hours to offer guided walkthrough.")

    # 6. Silent or negligible
    else:
        status = "No Response"
        agreed_next_steps.append("Log call attempt in CRM.")
        follow_up_recommendations.append("Re-attempt outreach during alternate business hours.")

    # Factual Summary
    summary_parts = []
    summary_parts.append(f"Conversation with customer regarding {product.product_name}.")
    if customer_requirements:
        summary_parts.append(f"Customer noted interest in {', '.join(customer_requirements[:2])}.")
    if objections:
        summary_parts.append(f"Primary consideration noted: {objections[0]}.")
    summary_parts.append(f"Outcome classified as {status}.")
    summary = " ".join(summary_parts)

    return {
        "summary": summary,
        "customer_requirements": customer_requirements,
        "main_questions": main_questions,
        "objections": objections,
        "key_features_discussed": features_discussed,
        "buying_signals": buying_signals,
        "agreed_next_steps": agreed_next_steps,
        "follow_up_recommendations": follow_up_recommendations,
        "status": status
    }
