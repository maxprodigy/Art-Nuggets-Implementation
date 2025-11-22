import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def analyze_results():
    df = pd.read_csv('results/experiment_results.csv')
    
    # Basic statistics
    print("Overall Results:")
    print(df.groupby(['model', 'strategy'])['average_score'].mean())
    
    print("\nBest Performing Model-Strategy Combinations:")
    print(df.groupby(['model_name', 'strategy'])['average_score'].mean().nlargest(10))
    
    # Create visualizations
    plt.figure(figsize=(16, 12))
    
    # Accuracy by model and strategy
    plt.subplot(2, 3, 1)
    pivot_data = df.pivot_table(
        values='average_score', 
        index='model', 
        columns='strategy', 
        aggfunc='mean'
    )
    sns.heatmap(pivot_data, annot=True, cmap='YlOrRd', fmt='.2f')
    plt.title('Accuracy by Model and Strategy')
    plt.ylabel('Model')
    
    # Response time comparison
    plt.subplot(2, 3, 2)
    time_data = df.pivot_table(
        values='response_time', 
        index='model', 
        columns='strategy', 
        aggfunc='mean'
    )
    sns.heatmap(time_data, annot=True, cmap='Blues', fmt='.2f')
    plt.title('Response Time (seconds)')
    plt.ylabel('Model')
    
    # Performance by task
    plt.subplot(2, 3, 3)
    task_data = df.groupby(['task', 'model'])['average_score'].mean().unstack()
    task_data.plot(kind='bar', ax=plt.gca())
    plt.title('Performance by Task and Model')
    plt.xticks(rotation=45)
    plt.ylabel('Average Score')
    plt.legend(title='Model', bbox_to_anchor=(1.05, 1), loc='upper left')
    
    # Best performing combinations
    plt.subplot(2, 3, 4)
    best_combinations = df.groupby(['model', 'strategy'])['average_score'].mean().nlargest(10)
    best_combinations.plot(kind='barh')
    plt.title('Top 10 Model-Strategy Combinations')
    plt.xlabel('Average Score')
    plt.gca().invert_yaxis()
    
    # Performance by contract type
    plt.subplot(2, 3, 5)
    contract_data = df.groupby(['contract_type', 'model'])['average_score'].mean().unstack()
    contract_data.plot(kind='bar', ax=plt.gca())
    plt.title('Performance by Contract Type')
    plt.xticks(rotation=45)
    plt.ylabel('Average Score')
    plt.legend(title='Model', bbox_to_anchor=(1.05, 1), loc='upper left')
    
    # Strategy comparison across models
    plt.subplot(2, 3, 6)
    strategy_data = df.groupby(['strategy'])['average_score'].mean()
    strategy_data.plot(kind='bar')
    plt.title('Overall Strategy Comparison')
    plt.ylabel('Average Score')
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    plt.savefig('results/performance_comparison.png', dpi=300, bbox_inches='tight')
    print("\nVisualization saved to results/performance_comparison.png")
    plt.show()

if __name__ == "__main__":
    analyze_results()