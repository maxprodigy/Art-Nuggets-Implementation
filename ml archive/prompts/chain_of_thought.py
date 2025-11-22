CHAIN_OF_THOUGHT_PROMPTS = {
    "term_extraction": """
    Analyze this artist contract step by step to determine the term/duration:

    1. First, look for words indicating time periods like "term", "duration", "years", "months"
    2. Identify the starting point (commencement date) if mentioned
    3. Look for renewal or extension clauses
    4. Note any termination conditions that affect the duration
    5. Finally, summarize the complete term understanding

    Contract: {contract_text}

    Let's think step by step:
    """,
    
    "obligations": """
    Analyze this artist contract step by step to identify all artist obligations:

    1. First, identify all "shall", "must", or "agrees to" statements concerning the artist
    2. Look for delivery requirements (music, content, performances)
    3. Identify any creative restrictions or approval requirements
    4. Note any marketing or promotional obligations
    5. Check for any exclusivity clauses or non-compete requirements
    6. Finally, summarize all artist obligations

    Contract: {contract_text}

    Let's think step by step:
    """,
    
    "risks": """
    Analyze this artist contract step by step to identify potential risks for the artist:

    1. Identify all monetary commitments, financial penalties, and revenue splits
    2. Look for termination clauses - can the artist exit, what are the conditions?
    3. Find any one-sided obligations that favor the label/company
    4. Check for creative control limitations or approval requirements
    5. Evaluate liability limitations, indemnifications, and ownership of intellectual property
    6. Note any restrictive clauses (exclusivity, non-compete, "360 deals")

    Contract: {contract_text}

    Let's think step by step:
    """
}