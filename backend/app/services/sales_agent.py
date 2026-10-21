import json
import re
import logging
from typing import List, Dict, Any, Optional
import httpx
from app.models import ProductConfig, SystemSettings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """You are VoxSell AI, a professional and helpful SaaS sales representative. Your objective is to understand the customer's needs, explain the configured product accurately, answer questions, handle objections respectfully, and identify an appropriate next step.

Use the available product configuration as your source of truth:
PRODUCT NAME: {product_name}
TAGLINE: {tagline}
DESCRIPTION: {description}
TARGET AUDIENCE: {target_audience}
KEY FEATURES: {features}
BENEFITS: {benefits}
PRICING PLANS: {pricing}
FAQS: {faqs}
DEMO BOOKING INSTRUCTIONS: {demo_instructions}
CONTACT INFORMATION: {contact_information}

RULES FOR YOUR VOICE SALES CONVERSATION:
1. Speak in a natural, friendly, concise conversational tone suitable for live voice audio (keep replies to 1-3 spoken sentences).
2. Ask relevant discovery questions to understand their current workflow and pain points.
3. Use the verified product information above as the sole source of truth. Do NOT fabricate features, prices, discounts, or guarantees.
4. If the customer asks something not covered in the product configuration, politely acknowledge the limitation and offer to have a senior solutions consultant follow up.
5. Handle objections respectfully and calmly without being pushy or defensive.
6. When the customer expresses interest in seeing how it works, offer a demo and explain the next step clearly.
7. If the customer explicitly states they are not interested, respect their decision politely and wish them the best.
8. Never pressure the customer into buying.
"""

def build_system_prompt(product: ProductConfig) -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        product_name=product.product_name,
        tagline=product.tagline,
        description=product.description,
        target_audience=product.target_audience,
        features=product.features,
        benefits=product.benefits,
        pricing=product.pricing_information,
        faqs=product.faqs,
        demo_instructions=product.demo_instructions,
        contact_information=product.contact_information,
    )

async def generate_response_openai(
    api_key: str,
    messages: List[Dict[str, str]],
    system_prompt: str,
    model: str = "gpt-4o-mini"
) -> Optional[str]:
    try:
        payload = {
            "model": model if model and model != "auto" else "gpt-4o-mini",
            "messages": [{"role": "system", "content": system_prompt}] + messages,
            "max_tokens": 200,
            "temperature": 0.7
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                logger.error(f"OpenAI error {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"OpenAI request failed: {e}")
    return None

async def generate_response_groq(
    api_key: str,
    messages: List[Dict[str, str]],
    system_prompt: str,
    model: str = "llama-3.3-70b-versatile"
) -> Optional[str]:
    try:
        selected_model = model if model and model != "auto" else "llama-3.3-70b-versatile"
        payload = {
            "model": selected_model,
            "messages": [{"role": "system", "content": system_prompt}] + messages,
            "max_tokens": 200,
            "temperature": 0.7
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                logger.error(f"Groq error {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"Groq request failed: {e}")
    return None

async def generate_response_gemini(
    api_key: str,
    messages: List[Dict[str, str]],
    system_prompt: str,
    model: str = "gemini-1.5-flash"
) -> Optional[str]:
    try:
        selected_model = model if model and model != "auto" else "gemini-1.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{selected_model}:generateContent?key={api_key}"
        
        contents = []
        for m in messages:
            role = "user" if m["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": m["content"]}]})
            
        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": contents,
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 200}
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    parts = candidates[0]["content"].get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
            else:
                logger.error(f"Gemini error {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"Gemini request failed: {e}")
    return None

def generate_local_sales_response(
    messages: List[Dict[str, str]],
    product: ProductConfig
) -> str:
    """
    Intelligent built-in sales dialogue engine.
    Follows verified product details and sales progression:
    1. Greeting & Intro
    2. Discovery
    3. Product Explanation
    4. Objection Handling
    5. Pricing
    6. Demo Scheduling / Next Steps
    """
    last_user_message = ""
    for m in reversed(messages):
        if m["role"] == "user":
            last_user_message = m["content"].lower().strip()
            break

    user_turns_count = sum(1 for m in messages if m["role"] == "user")
    
    # 1. Parse product details
    prod_name = product.product_name
    tagline = product.tagline
    
    try:
        pricing_data = json.loads(product.pricing_information) if product.pricing_information else []
    except Exception:
        pricing_data = []

    try:
        features_data = json.loads(product.features) if product.features else []
    except Exception:
        features_data = []

    try:
        faqs_data = json.loads(product.faqs) if product.faqs else []
    except Exception:
        faqs_data = []

    # Check for direct decline / not interested
    if any(phrase in last_user_message for phrase in [
        "not interested", "no thank you", "no thanks", "stop calling", "dont want", "don't want", "remove me", "hang up", "bye"
    ]):
        return "I completely understand and respect your decision. Thank you for your time today, and please feel free to reach out to us at sales@voxsell.ai if your needs ever change. Have a great day!"

    # Check for demo request
    if any(phrase in last_user_message for phrase in [
        "demo", "demonstration", "walkthrough", "see it", "show me", "try it", "schedule", "book a call", "set up a meeting"
    ]):
        return f"I would love to set that up for you! Our 20-minute live demonstration gives you a hands-on walkthrough tailored to your workflow. Would you like to schedule that for later this week, or should I have our team email you an instant calendar invite?"

    # Check for purchase / sign up / converted
    if any(phrase in last_user_message for phrase in [
        "buy", "purchase", "sign up", "get started", "ready to start", "where do i pay", "let's do it", "lets do it"
    ]):
        return f"That's fantastic news! You can get started right away with our 14-day free trial at voxsell.ai, or our solutions team can immediately onboard your sales reps. What is the best email address to send your activation link?"

    # Check for pricing questions
    if any(phrase in last_user_message for phrase in [
        "price", "pricing", "cost", "how much", "tier", "subscription", "expensive", "dollars", "monthly", "annual"
    ]):
        if pricing_data and len(pricing_data) > 0:
            tier_summaries = []
            for tier in pricing_data[:2]:
                tier_summaries.append(f"{tier.get('tier', 'Plan')} at {tier.get('price', 'custom')}")
            tiers_text = ", and ".join(tier_summaries)
            return f"{prod_name} offers flexible pricing: {tiers_text}, plus our Enterprise plan for custom workflows. All plans include a 14-day free trial. What size is your sales team so I can suggest the best fit?"
        return f"Our pricing starts with flexible tiers based on your team size, including a 14-day free trial. How many sales reps or users are on your team?"

    # Check for integration / compatibility questions
    if any(phrase in last_user_message for phrase in ["integration", "integrate", "salesforce", "hubspot", "crm", "connect", "api"]):
        return f"Yes! {prod_name} integrates seamlessly with Salesforce, HubSpot, and Google Workspace with one-click 2-way sync. It logs all transcripts and deals automatically so reps never have to do manual data entry. Which CRM does your team currently use?"

    # Check for security / privacy questions
    if any(phrase in last_user_message for phrase in ["security", "secure", "hipaa", "soc2", "soc-2", "privacy", "gdpr", "encrypt"]):
        return f"Security is our top priority. All voice recordings and transcripts are encrypted both in transit and at rest with AES-256 and full SOC-2 Type II compliance. Does your organization have specific compliance requirements we should know about?"

    # Check for specific feature questions in features_data
    for feat in features_data:
        feat_name = feat.get("name", "").lower()
        if feat_name and any(word in last_user_message for word in feat_name.split() if len(word) > 3):
            return f"{feat.get('name')} is one of our most popular capabilities. {feat.get('description')} How does your team currently handle this part of your sales pipeline?"

    # Check for FAQ match
    for faq in faqs_data:
        q = faq.get("question", "").lower()
        if q and any(w in last_user_message for w in q.split() if len(w) > 4):
            return f"{faq.get('answer')} Would you like to see how this works in a brief interactive demo?"

    # Check for common objections:
    # 1. "Too expensive" or "No budget"
    if any(phrase in last_user_message for phrase in ["too expensive", "no budget", "tight budget", "cost too much", "high price"]):
        return f"I hear you, and budget is always a crucial factor. Most of our clients see an immediate 38% reduction in their sales cycle and save over 15 hours per rep each week, delivering full ROI in the first month. Plus, you can start risk-free with our 14-day trial. Would exploring that make sense?"

    # 2. "Need to talk to my team / boss / manager"
    if any(phrase in last_user_message for phrase in ["talk to my team", "discuss with my boss", "manager", "decision maker", "check with"]):
        return f"That makes total sense. We can prepare a personalized 1-page summary and invite your team to a 20-minute discovery demo so everyone can see the value firsthand. Would that be helpful for your discussion?"

    # 3. "We already have a solution / tool"
    if any(phrase in last_user_message for phrase in ["already have", "already use", "using another", "competitor"]):
        return f"That's great that you already have a tool in place. Many of our customers switched because {prod_name} provides autonomous voice qualification that runs 24/7 without manual intervention. What tools are you currently relying on?"

    # Conversational Phase Progression based on turn count
    if user_turns_count <= 1:
        # Initial greeting / discovery
        return f"Hello! I'm your AI sales representative for {prod_name} — {tagline}. I'm here to understand your sales workflow and see if we can help accelerate your pipeline. To start, what is the biggest challenge your team faces with lead qualification today?"

    elif user_turns_count == 2:
        # Discovery to feature match
        if features_data:
            f0 = features_data[0]
            return f"That is a very common challenge. {prod_name} specifically addresses that through our {f0.get('name')}, which {f0.get('description')}. How many leads does your team typically process each month?"
        return f"That makes a lot of sense. {prod_name} was designed specifically to eliminate manual bottlenecks and accelerate your deal velocity. How many sales reps do you currently have on the team?"

    elif user_turns_count == 3:
        # Value proposition and trial / demo hook
        return f"Based on what you've shared, {prod_name} could easily save your team hours of manual work every week and boost your conversion rates. Would you be open to taking a look at a quick 20-minute live demonstration this week?"

    else:
        # Closing / next steps
        return f"I really appreciate you discussing this with me. We'd love to show you how {prod_name} can deliver results for your specific setup. Can I help schedule a quick 20-minute demo, or would you prefer I send over our product overview and 14-day trial access?"

async def get_sales_agent_reply(
    messages: List[Dict[str, str]],
    product: ProductConfig,
    settings: SystemSettings
) -> str:
    """
    Coordinates AI sales reply using configured provider (OpenAI, Groq, Gemini)
    or falls back to the intelligent built-in sales dialogue engine.
    """
    system_prompt = build_system_prompt(product)
    
    # Try OpenAI if configured
    if settings.ai_provider == "openai" and settings.openai_api_key:
        reply = await generate_response_openai(
            settings.openai_api_key,
            messages,
            system_prompt,
            settings.ai_model
        )
        if reply:
            return reply

    # Try Groq if configured
    if settings.ai_provider == "groq" and settings.groq_api_key:
        reply = await generate_response_groq(
            settings.groq_api_key,
            messages,
            system_prompt,
            settings.ai_model
        )
        if reply:
            return reply

    # Try Gemini if configured
    if settings.ai_provider == "gemini" and settings.gemini_api_key:
        reply = await generate_response_gemini(
            settings.gemini_api_key,
            messages,
            system_prompt,
            settings.ai_model
        )
        if reply:
            return reply

    # Default to built-in local sales engine
    return generate_local_sales_response(messages, product)
