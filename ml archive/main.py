import asyncio
import json
import pandas as pd
from clients.llm_clients import LLMClients
from prompts.zero_shot import ZERO_SHOT_PROMPTS
from prompts.few_shot import FEW_SHOT_PROMPTS  
from prompts.chain_of_thought import CHAIN_OF_THOUGHT_PROMPTS
from evaluation.metrics import EvaluationMetrics
from config.api_config import API_CONFIG

class ContractAnalyzerExperiment:
    def __init__(self):
        self.clients = LLMClients()
        self.metrics = EvaluationMetrics()
        self.results = []
        
    def load_test_data(self):
        with open('data/test_contracts.json', 'r') as f:
            return json.load(f)['contracts']
    
    async def run_experiment(self):
        contracts = self.load_test_data()
        models = list(API_CONFIG["groq"]["models"].keys())  # ['llama3', 'llama3_8b', 'mixtral', 'gemma']
        strategies = ['zero_shot', 'few_shot', 'chain_of_thought']
        tasks = ['term_extraction', 'obligations', 'risks']
        
        for contract in contracts:
            for model_key in models:
                for strategy in strategies:
                    for task in tasks:
                        result = await self.run_single_test(
                            contract, model_key, strategy, task
                        )
                        self.results.append(result)
                        print(f"Completed: {model_key}, {strategy}, {task}, Contract: {contract['id']}")
        
        self.save_results()
    
    async def run_single_test(self, contract, model_key, strategy, task):
        # Select prompt based on strategy
        if strategy == 'zero_shot':
            prompt_template = ZERO_SHOT_PROMPTS[task]
        elif strategy == 'few_shot':
            prompt_template = FEW_SHOT_PROMPTS[task]
        else:  # chain_of_thought
            prompt_template = CHAIN_OF_THOUGHT_PROMPTS[task]
        
        prompt = prompt_template.format(contract_text=contract['text'])
        
        # Call Groq with specified model
        response_data = await self.clients.call_groq(model_key, prompt)
        
        # Calculate scores for each ground truth field
        scores = {}
        for field, expected in contract['ground_truth'].items():
            if response_data['response'] and not response_data['error']:
                scores[field] = self.metrics.comprehensive_score(
                    response_data['response'], expected
                )
            else:
                scores[field] = 0
        
        avg_score = sum(scores.values()) / len(scores) if scores else 0
        
        return {
            'contract_id': contract['id'],
            'contract_type': contract['type'],
            'model': model_key,
            'model_name': API_CONFIG["groq"]["models"][model_key],
            'strategy': strategy,
            'task': task,
            'response': response_data['response'],
            'response_time': response_data['response_time'],
            'error': response_data['error'],
            'scores': scores,
            'average_score': avg_score
        }
    
    def save_results(self):
        df = pd.DataFrame(self.results)
        df.to_csv('results/experiment_results.csv', index=False)
        
        # Save detailed results
        with open('results/detailed_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print("Results saved successfully!")

async def main():
    experiment = ContractAnalyzerExperiment()
    await experiment.run_experiment()

if __name__ == "__main__":
    asyncio.run(main())