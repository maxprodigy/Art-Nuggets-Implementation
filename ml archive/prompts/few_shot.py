FEW_SHOT_PROMPTS = {
    "term_extraction": """
    Example 1:
    Contract: "This record deal shall commence on January 1, 2024 and continue for a period of two (2) years."
    Term: 2 years

    Example 2:
    Contract: "The initial term is twelve months, automatically renewing for successive one-year periods unless terminated."
    Term: 12 months with automatic renewal

    Now analyze this artist contract:
    Contract: {contract_text}
    Term:
    """,
    
    "obligations": """
    Example 1:
    Contract: "Artist shall deliver two singles within 6 months and provide monthly recording updates."
    Obligations:
    - Deliver two singles within 6 months
    - Provide monthly recording updates

    Example 2:
    Contract: "Artist must perform at scheduled shows and maintain social media presence with at least 3 posts per week."
    Obligations:
    - Perform at scheduled shows
    - Maintain social media presence (minimum 3 posts per week)

    Now analyze this artist contract:
    Contract: {contract_text}
    Obligations:
    """,
    
    "risks": """
    Example 1:
    Contract: "Artist agrees to pay management fee of 20% of all earnings. Artist must maintain exclusive relationship and cannot sign with other labels."
    Risks:
    - High management fee of 20% reduces artist earnings
    - Exclusive relationship limits artist's career freedom
    - Cannot pursue opportunities with other labels

    Example 2:
    Contract: "Artist must deliver album within 3 months or pay penalty of $10,000. Label owns 80% of all royalties."
    Risks:
    - Short delivery deadline creates pressure
    - Heavy financial penalty for missed deadline
    - Unfavorable royalty split heavily favoring label

    Now analyze this artist contract:
    Contract: {contract_text}
    Risks:
    """
}