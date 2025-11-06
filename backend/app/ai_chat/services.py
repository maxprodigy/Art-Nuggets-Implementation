import io
import re
from typing import Optional, List
from groq import Groq
from PyPDF2 import PdfReader
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings


class ContractAnalyzerService:
    """Service for analyzing contracts using Groq AI"""

    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL  # Qwen3 32B model on Groq (configurable)
        # Approximate token limit: 6000 TPM, reserve ~2000 for prompt/examples, ~2000 for response, ~2000 for contract
        # Rough estimate: 1 token ≈ 4 characters, so ~8000 chars for contract text (conservative)
        self.MAX_CONTRACT_CHARS = 8000  # Reduced to account for large prompt overhead

        # Key terms to search for in contracts (important sections)
        self.KEY_TERMS = [
            r"\b(payment|compensation|fee|royalty|advance|salary|wage)\b",
            r"\b(intellectual property|copyright|ownership|license|rights|IP)\b",
            r"\b(termination|cancellation|breach|default)\b",
            r"\b(liability|indemnification|warranty|guarantee)\b",
            r"\b(confidentiality|non-disclosure|NDA|privacy)\b",
            r"\b(deliverable|scope|work|services|obligation)\b",
            r"\b(duration|term|period|expiration|renewal)\b",
            r"\b(dispute|arbitration|jurisdiction|governing law)\b",
        ]

    def extract_text_from_pdf(self, file: UploadFile) -> str:
        """Extract text content from a PDF file"""
        try:
            # Read the file content
            content = file.file.read()
            pdf_file = io.BytesIO(content)

            # Create PDF reader
            pdf_reader = PdfReader(pdf_file)

            # Extract text from all pages
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

            return text.strip()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to extract text from PDF: {str(e)}",
            )

    def smart_extract_contract_sections(self, full_text: str) -> tuple[str, bool]:
        """
        Intelligently extract key sections from a contract to stay within token limits.
        Prioritizes: beginning, sections with key terms, and ending.
        Returns (extracted_text, was_truncated)
        """
        if len(full_text) <= self.MAX_CONTRACT_CHARS:
            return full_text, False

        was_truncated = True
        extracted_parts: List[str] = []
        chars_used = 0

        # 1. Always include the beginning (first 30% of limit) - usually has definitions and main terms
        beginning_chars = int(self.MAX_CONTRACT_CHARS * 0.3)
        beginning = full_text[:beginning_chars]
        # Try to end at a sentence boundary
        last_period = beginning.rfind(".")
        if last_period > beginning_chars * 0.7:
            beginning = beginning[: last_period + 1]
        extracted_parts.append(f"[BEGINNING OF CONTRACT]\n{beginning}")
        chars_used += len(beginning)

        # 2. Find and extract sections containing key terms (middle sections)
        remaining_chars = (
            self.MAX_CONTRACT_CHARS - chars_used - 2000
        )  # Reserve 2000 for ending
        key_sections = self._extract_key_term_sections(full_text, remaining_chars)

        if key_sections:
            extracted_parts.append(
                f"\n\n[KEY SECTIONS - Payment, IP, Termination, etc.]\n{key_sections}"
            )
            chars_used += len(key_sections)

        # 3. Always include the ending (last 30% of limit) - often has important clauses
        ending_chars = int(self.MAX_CONTRACT_CHARS * 0.3)
        ending = full_text[-ending_chars:]
        # Try to start at a sentence boundary
        first_period = ending.find(".")
        if first_period < ending_chars * 0.3 and first_period > 0:
            ending = ending[first_period + 1 :]
        extracted_parts.append(f"\n\n[END OF CONTRACT]\n{ending}")

        combined = "\n".join(extracted_parts)

        # Final safety check - truncate if still too long
        if len(combined) > self.MAX_CONTRACT_CHARS:
            combined = combined[: self.MAX_CONTRACT_CHARS]
            # Try to end at a sentence
            last_period = combined.rfind(".")
            if last_period > self.MAX_CONTRACT_CHARS * 0.9:
                combined = combined[: last_period + 1]

        return combined, was_truncated

    def _extract_key_term_sections(self, text: str, max_chars: int) -> str:
        """Extract sections of text that contain important contract terms"""
        if max_chars <= 0:
            return ""

        # Split text into sentences for better granularity
        sentences = re.split(r"(?<=[.!?])\s+", text)
        relevant_sentences = []
        chars_used = 0

        # Score sentences based on key term matches
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            if len(sentence) < 20:  # Skip very short sentences
                continue
            score = sum(
                1
                for pattern in self.KEY_TERMS
                if re.search(pattern, sentence, re.IGNORECASE)
            )
            if score > 0:
                scored_sentences.append((score, i, sentence))

        # Sort by score (most relevant first) and take top matches
        scored_sentences.sort(reverse=True, key=lambda x: x[0])

        # Extract sentences, trying to maintain some context
        extracted_indices = set()
        for score, idx, sentence in scored_sentences[:50]:  # Top 50 most relevant
            if chars_used + len(sentence) > max_chars:
                break
            # Include some context (previous and next sentence if available)
            context_start = max(0, idx - 1)
            context_end = min(len(sentences), idx + 2)

            for j in range(context_start, context_end):
                if (
                    j not in extracted_indices and j != 0
                ):  # Skip first sentence (already in beginning)
                    extracted_indices.add(j)
                    relevant_sentences.append((j, sentences[j]))
                    chars_used += len(sentences[j])
                    if chars_used > max_chars:
                        break
            if chars_used > max_chars:
                break

        # Sort by original position to maintain some order
        relevant_sentences.sort(key=lambda x: x[0])
        return " ".join(sent for _, sent in relevant_sentences)

    def extract_reasoning_and_clean_response(self, text: str) -> tuple[str, str]:
        """
        Extract reasoning tags and clean the main response.
        Returns (main_response, reasoning_text)
        """
        reasoning_text = ""
        main_response = text

        # Extract reasoning tags (various formats)
        reasoning_patterns = [
            (r"<think>(.*?)</think>", re.DOTALL | re.IGNORECASE),
            (r"<think>(.*?)</think>", re.DOTALL | re.IGNORECASE),
            (r"`<think>`(.*?)`</think>`", re.DOTALL | re.IGNORECASE),
            (r"`<think>`(.*?)`</think>`", re.DOTALL | re.IGNORECASE),
            (r"<thinking>(.*?)</thinking>", re.DOTALL | re.IGNORECASE),
            (r"<reasoning>(.*?)</reasoning>", re.DOTALL | re.IGNORECASE),
            (r"```<think>.*?```", re.DOTALL | re.IGNORECASE),
            (r"```<reasoning>.*?```", re.DOTALL | re.IGNORECASE),
        ]

        for pattern, flags in reasoning_patterns:
            matches = re.findall(pattern, main_response, flags)
            if matches:
                reasoning_text = "\n\n".join(matches).strip()
                # Remove reasoning tags from main response
                main_response = re.sub(pattern, "", main_response, flags=flags)

        # Clean markdown formatting from main response
        # Remove markdown headers (###, ##, #)
        main_response = re.sub(r"^#{1,6}\s+", "", main_response, flags=re.MULTILINE)

        # Remove markdown bold (**text** or __text__)
        main_response = re.sub(r"\*\*(.*?)\*\*", r"\1", main_response)
        main_response = re.sub(r"__(.*?)__", r"\1", main_response)

        # Remove markdown italic (*text* or _text_)
        main_response = re.sub(
            r"(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)", r"\1", main_response
        )
        main_response = re.sub(r"(?<!_)_(?!_)(.*?)(?<!_)_(?!_)", r"\1", main_response)

        # Remove markdown code blocks (but keep inline code content)
        main_response = re.sub(
            r"```[a-z]*\n(.*?)```", r"\1", main_response, flags=re.DOTALL
        )
        main_response = re.sub(r"`([^`]+)`", r"\1", main_response)

        # Remove horizontal rules (---, ***)
        main_response = re.sub(r"^[-*]{3,}$", "", main_response, flags=re.MULTILINE)

        # Clean up multiple newlines
        main_response = re.sub(r"\n{3,}", "\n\n", main_response)
        main_response = main_response.strip()

        return main_response, reasoning_text

    def format_response_with_reasoning(
        self, main_response: str, reasoning_text: str
    ) -> str:
        """
        Format the response with reasoning separated clearly.
        Reasoning comes first but is less prominent.
        """
        if not reasoning_text:
            return main_response

        # Create a subtle separator for reasoning (less prominent)
        # Using a lighter separator that's still readable
        separator = "--- Model Reasoning ---\n\n"

        # Put reasoning first, then main response
        formatted = (
            separator + reasoning_text + "\n\n" + "=" * 60 + "\n\n" + main_response
        )

        return formatted

    def build_few_shot_prompt(
        self,
        contract_text: str,
        user_text: Optional[str] = None,
        was_truncated: bool = False,
    ) -> str:
        """Build a few-shot prompt for contract analysis"""

        # System Prompt
        system_prompt = """You are a contract analysis assistant specializing in creative industry agreements. Your role is to help creative professionals understand their contracts by identifying key terms, potential areas of concern, and important clauses that warrant attention.

IMPORTANT FORMATTING REQUIREMENTS:
- Use plain text only for the main response - NO markdown formatting (no **, ###, #, __, etc.)
- If you include reasoning, wrap it in <reasoning>...</reasoning> tags
- Use simple bullet points with dashes (-) for lists
- Use clear section headers in plain text (e.g., "Key Financial Terms:" not "### Key Financial Terms")
- Write in a clean, readable format without special formatting characters

Core Principles:
- Present factual observations about contract terms without making judgments about whether the contract is "good" or "bad"
- Highlight clauses that commonly require careful consideration in creative contracts
- Explain technical legal language in plain terms
- Point out what's present AND what's notably absent
- Frame findings as informational, not prescriptive
- Always defer to legal professionals for specific advice

Response Structure:
- Key Financial Terms: Payment structure, rates, royalties, expenses
- Intellectual Property Rights: Ownership, licensing, usage rights, attribution
- Scope and Deliverables: What's expected and timelines
- Notable Clauses: Termination, revisions, liability, confidentiality
- Areas Requiring Attention: Clauses that creative professionals typically review carefully with legal counsel"""

        # Few-shot examples
        few_shot_examples = """
Example 1: Photography Contract
User: Can you review this photography contract? "The Client shall pay Photographer $2,000 upon completion. All photographs and negatives shall become the exclusive property of the Client. Photographer grants Client unlimited usage rights in perpetuity across all media."
Assistant: Here's my analysis of this photography contract:

Key Financial Terms:
- Payment: $2,000 flat fee
- Payment timing: Upon completion (no deposit or milestone payments mentioned)
- No mention of expenses, overtime, or additional fees

Intellectual Property Rights:
- Ownership: Contract states all photographs and negatives transfer to Client as "exclusive property"
- Usage rights: Unlimited usage across all media in perpetuity
- No mention of photographer's right to use images in portfolio or for self-promotion
- No attribution requirements specified

Notable Absences:
- No kill fee if project is cancelled
- No provision for licensing tiers or usage limitations
- No clause about photographer's portfolio rights
- No limitation period for usage rights

Areas Requiring Attention: The IP transfer and usage rights clauses are particularly significant in photography contracts. The phrase "exclusive property" combined with "unlimited usage rights in perpetuity" typically means you're transferring both copyright ownership and all future usage rights. Creative professionals often review these sections carefully with legal counsel to ensure they align with their business model and future needs.

The absence of portfolio usage rights may also be worth noting, as photographers typically retain the ability to showcase their work.

I recommend discussing these specific terms with a legal professional who can advise based on your specific situation and goals.

Example 2: Freelance Writing Contract
User: What do you think about this clause in my writing contract? "Writer agrees to deliver 10 articles per month at $100 per article. All work is considered work-for-hire. Client may request unlimited revisions until satisfied."
Assistant: Here's my analysis of these contract terms:

Key Financial Terms:
- Rate: $100 per article
- Volume: 10 articles per month ($1,000 monthly total)
- No mention of payment schedule (net 30, net 60, upon delivery, etc.)
- No mention of kill fees or payment for drafts if article is rejected

Scope and Deliverables:
- Deliverable: 10 articles monthly
- Revision policy: "Unlimited revisions until satisfied" with no defined parameters
- No specification of article length, complexity, or research requirements
- No timeline defined for revision requests or completion

Intellectual Property Rights:
- Classification: "Work-for-hire" designation
- This typically means the client owns all copyright from creation
- No mention of attribution/byline rights
- No mention of writer's ability to reuse research or republish work

Notable Absences:
- No definition of what constitutes "satisfaction" for revisions
- No timeline limits on revision requests
- No cap on number of revision rounds or scope of revisions
- No specification of word count or research depth

Areas Requiring Attention: The "unlimited revisions" clause is particularly notable as it doesn't define boundaries around scope, timeframe, or what constitutes a reasonable revision versus a complete rewrite. Creative professionals often find it helpful to discuss with legal counsel how such clauses might affect their time investment and effective hourly rate.

The work-for-hire designation has specific legal implications for copyright ownership that writers typically review carefully based on their career goals and content strategy.

Consider consulting with a legal professional about these specific terms and whether additional parameters would be appropriate for your situation.

Example 3: Graphic Design Contract
User: I have a design contract that says "Designer retains copyright but grants Client exclusive license for use in marketing materials for 2 years. After 2 years, license becomes non-exclusive. Designer may use work in portfolio with Client approval." Is this okay?
Assistant: Here's my analysis of these intellectual property terms:

Intellectual Property Rights:
- Copyright ownership: Designer retains copyright (you maintain ownership)
- License type: Exclusive license for 2 years, then converts to non-exclusive
- Usage scope: Limited to "marketing materials" (specific use case defined)
- Time limitation: 2-year exclusivity period with defined end point
- Portfolio rights: Allowed with client approval requirement

What This Structure Typically Means:
- You retain ownership of the underlying copyright
- Client has sole right to use in marketing for 2 years (exclusivity)
- After 2 years, you could license to others while client continues using
- "Marketing materials" as a defined scope (may want clarity on what this includes/excludes)
- Portfolio use requires asking permission rather than being automatically granted

Notable Aspects:
- The time-limited exclusivity with reversion to non-exclusive is a licensing structure seen in creative contracts
- "Marketing materials" may benefit from definition (does it include social media, packaging, billboards, digital ads, print, etc.?)
- Portfolio approval requirement means you'd need to request permission each time
- No mention of attribution/credit requirements

Areas That Creative Professionals Often Discuss with Legal Counsel:
- Whether "marketing materials" is defined broadly or narrowly enough for both parties' needs
- The implications of portfolio use requiring ongoing approval versus automatic right
- What happens if the client is acquired or the brand changes hands

These IP terms represent one of many possible licensing structures. A legal professional can help you understand how this specific arrangement aligns with your business practices and long-term goals."""

        # Key Guidelines
        guidelines = """
Key Guidelines for Responses:
✅ Do:
- Use neutral language: "This clause means..." "Typically in creative contracts..." "This is a common area that professionals review..."
- Identify missing elements that are standard in creative contracts
- Explain technical terms in accessible language
- Point out ambiguities or areas lacking specificity
- Suggest consulting legal professionals for interpretation

❌ Don't:
- Say "This is a bad/good contract" or "You should/shouldn't sign"
- Use alarmist language: "This is a red flag!" "Run away from this!"
- Make specific legal recommendations
- Predict outcomes or guarantee interpretations
- Compare to what they "deserve" or what's "fair"
"""

        truncation_note = ""
        if was_truncated:
            truncation_note = "\n\nNOTE: Due to length limitations, this analysis includes the beginning of the contract, key sections containing important terms (payment, IP rights, termination, etc.), and the ending. Some middle sections may have been omitted. For a complete analysis of all clauses, consider reviewing the full contract with legal counsel."

        # Build the prompt
        prompt = f"""{system_prompt}

{few_shot_examples}

{guidelines}

Now analyze the following contract:{truncation_note}

CONTRACT TEXT:
{contract_text}
"""

        # Add user's additional text/questions if provided
        if user_text:
            prompt += f"""

USER'S ADDITIONAL QUESTIONS/CONTEXT:
{user_text}
"""

        prompt += "\n\nPlease provide a comprehensive analysis of this contract, following the format, structure, and guidelines shown in the examples above. Use neutral, informational language and always defer to legal professionals for specific advice. IMPORTANT: Use plain text only for the main response - no markdown formatting (no asterisks, hashes, or other markdown symbols). If you include reasoning, wrap it in <reasoning>...</reasoning> tags."

        return prompt

    async def analyze_contract(
        self, contract_text: str, user_text: Optional[str] = None
    ) -> str:
        """Analyze a contract using Groq AI"""

        if not settings.GROQ_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Groq API key is not configured",
            )

        try:
            # Smart extract contract sections if needed
            extracted_text, was_truncated = self.smart_extract_contract_sections(
                contract_text
            )

            # Build the prompt
            prompt = self.build_few_shot_prompt(
                extracted_text, user_text, was_truncated
            )

            # Estimate token count (rough: 1 token ≈ 4 characters)
            # Check if prompt is still too large
            estimated_tokens = len(prompt) / 4
            if estimated_tokens > 5500:  # Leave some buffer under 6000 limit
                # Further truncate contract text if needed
                contract_part_start = prompt.find("CONTRACT TEXT:")
                if contract_part_start > 0:
                    # Get the base prompt (everything before contract text)
                    base_prompt = prompt[:contract_part_start]
                    base_tokens = len(base_prompt) / 4
                    remaining_tokens = 5500 - base_tokens
                    max_contract_chars = int(
                        remaining_tokens * 4 * 0.9
                    )  # 90% to be safe

                    # Extract contract text from prompt
                    contract_start = prompt.find("\n", contract_part_start) + 1
                    contract_text_in_prompt = prompt[contract_start:]

                    if len(contract_text_in_prompt) > max_contract_chars:
                        # Further truncate
                        truncated_contract = contract_text_in_prompt[
                            :max_contract_chars
                        ]
                        last_period = truncated_contract.rfind(".")
                        if last_period > max_contract_chars * 0.9:
                            truncated_contract = truncated_contract[: last_period + 1]

                        prompt = base_prompt + "\n" + truncated_contract
                        was_truncated = True

            # Call Groq API
            chat_completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a contract analysis assistant specializing in creative industry agreements. Present factual observations about contract terms without making judgments. Explain technical legal language in plain terms. Always defer to legal professionals for specific advice.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,  # Lower temperature for more consistent, factual analysis
                max_tokens=3000,  # Increased for comprehensive analysis
            )

            analysis = chat_completion.choices[0].message.content

            # Extract reasoning and clean the main response
            main_response, reasoning_text = self.extract_reasoning_and_clean_response(
                analysis
            )

            # Format response with reasoning if it exists
            analysis = self.format_response_with_reasoning(
                main_response, reasoning_text
            )

            # Add warning if truncated
            if was_truncated:
                warning = (
                    "Important Note: This analysis is based on a strategic extraction of the contract that includes:\n"
                    "- The beginning (definitions, main terms)\n"
                    "- Key sections (payment, IP rights, termination, liability, etc.)\n"
                    "- The ending (important clauses, dispute resolution, etc.)\n\n"
                    "Some middle sections may have been omitted. For a complete analysis, please review the full contract with legal counsel.\n\n"
                )
                analysis = warning + analysis

            return analysis

        except Exception as e:
            error_message = str(e)
            if (
                "rate_limit_exceeded" in error_message
                or "Request too large" in error_message
            ):
                # Try one more time with even more aggressive truncation
                try:
                    # Reduce to 5000 chars max
                    very_short_text = contract_text[:5000]
                    last_period = very_short_text.rfind(".")
                    if last_period > 4000:
                        very_short_text = very_short_text[: last_period + 1]

                    prompt = self.build_few_shot_prompt(
                        very_short_text, user_text, True
                    )

                    chat_completion = self.client.chat.completions.create(
                        model=self.model,
                        messages=[
                            {
                                "role": "system",
                                "content": "You are a contract analysis assistant specializing in creative industry agreements. Present factual observations about contract terms without making judgments. Explain technical legal language in plain terms. Always defer to legal professionals for specific advice.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        temperature=0.3,
                        max_tokens=3000,
                    )

                    analysis = chat_completion.choices[0].message.content
                    # Extract reasoning and clean
                    main_response, reasoning_text = (
                        self.extract_reasoning_and_clean_response(analysis)
                    )
                    analysis = self.format_response_with_reasoning(
                        main_response, reasoning_text
                    )

                    warning = "Note: Due to contract length, only the first portion was analyzed. Please review the full contract with legal counsel.\n\n"
                    analysis = warning + analysis
                    return analysis
                except:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Contract is too large to analyze even after truncation. Please try a shorter contract or split it into sections.",
                    )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to analyze contract: {error_message}",
            )
