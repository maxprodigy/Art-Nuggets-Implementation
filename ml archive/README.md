# AI Contract Analyzer for Artists - LLM Comparison

An AI-powered contract analysis tool that compares different Large Language Models (LLMs) using various prompting strategies (Zero-shot, Few-shot, Chain-of-Thought) to identify the best model-strategy combination for analyzing artist contracts.

## Overview

This project helps artists analyze their contracts (record deals, management agreements, distribution deals) by:
- Comparing 5 different Groq models (free tier)
- Testing 3 different prompting strategies
- Evaluating performance across 3 analysis tasks
- Uploading and analyzing custom contracts
- Determining the most effective model-strategy combination

## Features

### Models (via Groq API - Free Tier)
- **Llama 3.1 8B Instant** - Fast, efficient small model
- **Llama 3.3 70B Versatile** - Medium-large, versatile model
- **Llama 4 Maverick 17B** - Newest Llama 4, specialized for instructions
- **Qwen 3 32B** - Diverse architecture from Alibaba
- **OpenAI GPT-OSS 120B** - OpenAI's open-source large model

### Prompting Strategies
- **Zero-Shot** - Direct analysis without examples
- **Few-Shot** - Analysis with examples for guidance
- **Chain-of-Thought** - Step-by-step reasoning process

### Analysis Tasks
1. **Term Extraction** - Extract contract duration and timeline
2. **Obligations** - Identify artist responsibilities and requirements
3. **Risks** - Highlight potential risks and liabilities

## Setup

### Prerequisites
- Python 3.8+
- Groq API key (free tier available at https://console.groq.com)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Zero_shot-Few_shot-Chain_of_Thoughts-LLM-Comparison
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

## Usage

### Upload Your Own Contracts (Optional)
```bash
python upload_contract.py
```

This interactive script allows you to:
- Upload contracts from `.txt` files
- Paste contract text directly
- Analyze your own artist contracts

Uploaded contracts are saved to `data/uploaded_contracts/`

### Run the Experiment
```bash
python main.py
```

This will run all combinations of:
- 5 models × 3 strategies × 3 tasks × 3 contracts = 135 test cases

Results will be saved to:
- `results/experiment_results.csv` - CSV data
- `results/detailed_results.json` - JSON with full responses

### Analyze Results
```bash
python results/analysis.py
```

This generates visualizations showing:
- Performance by model and strategy
- Response time comparisons
- Task-specific performance
- Best combinations

Visualization saved to: `results/performance_comparison.png`

## Project Structure

```
├── main.py                      # Main experiment runner
├── upload_contract.py           # Contract upload utility
├── clients/
│   └── llm_clients.py          # Groq API client
├── config/
│   └── api_config.py           # API configuration
├── prompts/
│   ├── zero_shot.py            # Zero-shot prompts
│   ├── few_shot.py             # Few-shot prompts
│   └── chain_of_thought.py     # Chain-of-thought prompts
├── evaluation/
│   └── metrics.py              # Evaluation metrics
├── utils/
│   └── contract_uploader.py    # Contract upload handler
├── data/
│   ├── test_contracts.json     # Test contracts (Record deals, Management, Distribution)
│   └── uploaded_contracts/    # User-uploaded contracts
└── results/
    ├── analysis.py             # Result analysis & visualization
    ├── experiment_results.csv  # Results (generated)
    └── performance_comparison.png  # Visualizations (generated)
```

## Evaluation Metrics

The evaluation uses a comprehensive scoring system combining:
- **Exact Match** (40% weight) - Perfect match with ground truth
- **Contains Score** (30% weight) - Contains key information
- **Semantic Similarity** (30% weight) - TF-IDF cosine similarity

## Customization

### Add More Contracts
Edit `data/test_contracts.json` to add artist contracts with ground truth labels.

### Modify Models
Update `config/api_config.py` to change models or add new ones.

### Adjust Prompts
Modify prompts in `prompts/` directory to tailor analysis for specific contract types.

## License

MIT License

## Contributing

Contributions welcome! Feel free to submit issues or pull requests.

## Acknowledgments

- Groq for providing free API access
- Meta, Mistral AI, and Google for open-source models