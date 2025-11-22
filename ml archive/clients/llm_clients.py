import time
from config.api_config import API_CONFIG
from groq import Groq


class LLMClients:
    def __init__(self):
        self.setup_clients()
    
    def setup_clients(self):
        # Groq
        self.groq_client = Groq(api_key=API_CONFIG["groq"]["api_key"])
        self.models = API_CONFIG["groq"]["models"]
        self.max_tokens = API_CONFIG["groq"]["max_tokens"]
        self.temperature = API_CONFIG["groq"]["temperature"]
    
    async def call_groq(self, model_key, prompt, max_retries=3):
        for attempt in range(max_retries):
            try:
                model_name = self.models[model_key]
                start_time = time.time()
                response = self.groq_client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=self.max_tokens,
                    temperature=self.temperature
                )
                end_time = time.time()
                return {
                    "response": response.choices[0].message.content,
                    "response_time": end_time - start_time,
                    "error": None
                }
            except Exception as e:
                if attempt == max_retries - 1:
                    return {"response": None, "response_time": None, "error": str(e)}
                time.sleep(2 ** attempt)