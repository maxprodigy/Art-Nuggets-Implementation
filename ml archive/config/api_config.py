import os
from dotenv import load_dotenv

load_dotenv()

API_CONFIG = {
    "groq": {
        "api_key": os.getenv("GROQ_API_KEY"),
        "models": {
            # Selected models for comprehensive comparison (verified available Dec 2024)
            "llama3_8b": "llama-3.1-8b-instant",              # Fast, efficient small model
            "llama3_70b": "llama-3.3-70b-versatile",          # Medium-large, versatile
            "llama_4_maverick": "meta-llama/llama-4-maverick-17b-128e-instruct",  # Newest Llama 4
            "qwen_32b": "qwen/qwen3-32b",                      # Diverse architecture
            "openai_gpt_120b": "openai/gpt-oss-120b"         # OpenAI's open-source 120B model
        },
        "max_tokens": 2000,
        "temperature": 0
    }
}