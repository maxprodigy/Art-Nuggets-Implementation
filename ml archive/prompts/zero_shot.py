ZERO_SHOT_PROMPTS = {
    "term_extraction": """
    Analyze the following artist contract and extract the term/duration of the agreement. Return only the specific term mentioned.

    Contract: {contract_text}

    Term:
    """,
    
    "obligations": """
    Identify all key obligations and responsibilities of the artist from this contract. List them as clear bullet points.

    Contract: {contract_text}

    Artist Obligations:
    """,
    
    "risks": """
    What are the potential risks and liabilities for the artist in this contract? Identify at least 3 key risks that could negatively impact the artist.

    Contract: {contract_text}

    Risks for Artist:
    """
}