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

        self.KEYWORD_SYNONYMS = {
            "payment": {"compensation", "fee", "payout", "remuneration"},
            "compensation": {"payment", "fee", "payout"},
            "fee": {"fees", "payment"},
            "royalty": {"royalties"},
            "salary": {"wage", "pay"},
            "intellectual": {"ip", "copyright"},
            "property": {"ownership"},
            "license": {"licence", "licensing"},
            "rights": {"usage", "use", "right"},
            "termination": {
                "terminate",
                "terminating",
                "cancellation",
                "cancel",
                "ending",
            },
            "notice": {"notification", "advance notice"},
            "liability": {"responsibility", "indemnity", "indemnification"},
            "indemnification": {"indemnity", "hold harmless"},
            "warranty": {"guarantee"},
            "confidentiality": {"nda", "non-disclosure", "secrecy"},
            "deliverable": {"deliverables", "deliveries", "work product"},
            "scope": {"services", "obligations", "responsibilities"},
            "duration": {"term", "length", "period"},
            "dispute": {"arbitration", "jurisdiction", "litigation"},
            "governing": {"jurisdiction", "law"},
        }

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

    def _extract_relevant_sections(
        self, text: str, user_text: Optional[str], max_chars: Optional[int] = None
    ) -> tuple[Optional[str], bool]:
        """Extract contract sections that relate to the user's specific question."""

        if not user_text:
            return None, False

        if max_chars is None:
            max_chars = self.MAX_CONTRACT_CHARS

        # Build keyword set from user text (words >= 3 characters)
        raw_words = re.findall(r"[A-Za-z0-9]{3,}", user_text)
        keywords = {
            word.lower()
            for word in raw_words
            if word.lower()
            not in {"please", "that", "about", "would", "could", "there", "which"}
        }

        # Add simple bigrams/trigrams for better phrase matching
        lowered_words = [w.lower() for w in raw_words]
        for n in (2, 3):
            for i in range(len(lowered_words) - n + 1):
                phrase = " ".join(lowered_words[i : i + n])
                if len(phrase.replace(" ", "")) >= 6:
                    keywords.add(phrase)

        # Include digit-based terms (e.g., notice periods like "30")
        number_terms = re.findall(r"\b\d+\b", user_text)
        for num in number_terms:
            keywords.add(num)

        # Morphological variants and synonyms
        expanded_keywords = set(keywords)
        for kw in list(keywords):
            if kw.endswith("ing") and len(kw) > 4:
                expanded_keywords.add(kw[:-3])
            if kw.endswith("ed") and len(kw) > 3:
                expanded_keywords.add(kw[:-2])
            if kw.endswith("s") and len(kw) > 3:
                expanded_keywords.add(kw[:-1])
            if kw in self.KEYWORD_SYNONYMS:
                expanded_keywords.update(self.KEYWORD_SYNONYMS[kw])

        keywords = expanded_keywords

        if not keywords:
            return None, False

        paragraphs = re.split(r"\n{2,}", text)
        scored_paragraphs: List[tuple[int, int, str]] = []

        for idx, paragraph in enumerate(paragraphs):
            clean_paragraph = paragraph.strip()
            if len(clean_paragraph) < 40:
                continue
            lower_paragraph = clean_paragraph.lower()
            score = 0
            for kw in keywords:
                if " " in kw:
                    if kw in lower_paragraph:
                        score += 2
                elif re.search(rf"\b{re.escape(kw)}\b", lower_paragraph):
                    score += 1
            if score:
                scored_paragraphs.append((score, idx, clean_paragraph))

        if not scored_paragraphs:
            return None, False

        # Sort by score (descending) then position (ascending)
        scored_paragraphs.sort(key=lambda x: (-x[0], x[1]))

        selected: List[tuple[int, str]] = []
        total_chars = 0

        for score, idx, paragraph in scored_paragraphs:
            paragraph_with_heading = f"[RELEVANT SECTION {idx + 1}]\n{paragraph}"
            paragraph_length = len(paragraph_with_heading)
            if total_chars + paragraph_length > max_chars:
                continue
            selected.append((idx, paragraph_with_heading))
            total_chars += paragraph_length + 2
            if total_chars >= max_chars:
                break

        if not selected:
            return None, False

        selected.sort(key=lambda x: x[0])
        combined = "\n\n".join(paragraph for _, paragraph in selected)
        return combined, True

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
        system_prompt = """You are a contract analysis assistant specializing in creative industry agreements. Your role is to help creative professionals understand their contracts by highlighting important terms, explaining legal language in plain English, and pointing out areas that typically require careful attention.

IMPORTANT FORMATTING REQUIREMENTS:
- Use plain text only for the main response - no Markdown formatting (no **, ###, #, __, etc.)
- If you include reasoning, wrap it in <reasoning>...</reasoning> tags
- When listing items, simple dashes (-) are fine but don't feel obligated to use a fixed outline
- Adapt your headings and structure to match the contract and the user's question instead of repeating the same template
- Keep the language clear, neutral, and informative

Core Principles:
- Present factual observations without judging whether the contract is "good" or "bad"
- Explain technical legal language in accessible terms
- Note both what's present and what's conspicuously missing
- Encourage professional legal review for specific advice
- Tailor the analysis to the context provided by the user, highlighting only the sections that matter most for their question"""

        # Few-shot examples
        few_shot_examples = """
Example 1 (Photography):
User question: "Can you review this photography contract? 'The Client shall pay Photographer $2,000 upon completion...'"
Assistant approach:
- Points out the flat fee, timing, and missing details about overtime/expenses.
- Highlights that the client takes full ownership with unlimited usage, and notes the absence of portfolio rights or attribution.
- Wraps up by suggesting the photographer discuss IP transfer with legal counsel.

Example 2 (Writing):
User question: "Clause says I must deliver 10 articles monthly at $100 each. It's work-for-hire and the client can request unlimited revisions."
Assistant approach:
- Flags the ongoing workload versus flat rate, and the lack of payment schedule or kill fee.
- Explains what "work-for-hire" means for copyright and byline rights.
- Calls out the unlimited revisions clause as undefined and worth clarifying with counsel.

Example 3 (Design):
User question: "Designer keeps copyright but gives the client an exclusive license for marketing for 2 years, then it becomes non-exclusive. Designer can use the work in their portfolio with approval."
Assistant approach:
- Explains the licensing structure, exclusivity window, and conversion to non-exclusive.
- Notes the need to define "marketing materials" and the implications of requiring approval for portfolio use.
- Encourages reviewing those points with legal counsel."""

        # Key Guidelines
        guidelines = """
Key Guidelines:
- Keep the tone steady and professional; adapt your structure to the user’s question.
- You don’t need to cover every possible section—focus on the clauses that matter most based on the prompt.
- When something important is missing, mention it as “not addressed in this excerpt” rather than guessing.
- Encourage the user to consult legal counsel using varied, natural phrasing rather than repeating the same sentence.
- Stay away from legal advice, moral judgments, or alarmist language."""

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

        prompt += "\n\nPlease analyze the contract in a flexible, conversational way that still covers the critical issues for creative professionals. Use neutral language, adapt the structure to the content, and end with a reminder to consult legal counsel (phrased naturally). IMPORTANT: Use plain text only—no Markdown symbols. If you include reasoning, wrap it in <reasoning>...</reasoning> tags."

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

            # If we have a user-specific question, try to pull the most relevant sections
            relevant_sections, used_relevant = self._extract_relevant_sections(
                contract_text, user_text
            )

            contract_context = extracted_text

            if relevant_sections:
                contract_context = (
                    "[TARGETED EXTRACT BASED ON QUESTION]\n" + relevant_sections
                )
                if len(contract_context) < self.MAX_CONTRACT_CHARS * 0.8:
                    remaining_chars = self.MAX_CONTRACT_CHARS - len(contract_context)
                    supplemental = extracted_text[:remaining_chars]
                    if supplemental:
                        contract_context += "\n\n[ADDITIONAL CONTEXT]\n" + supplemental
                was_truncated = was_truncated or used_relevant

            # Build the prompt
            prompt = self.build_few_shot_prompt(
                contract_context, user_text, was_truncated
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
