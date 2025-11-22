import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class EvaluationMetrics:
    @staticmethod
    def exact_match_score(predicted, expected):
        """Calculate exact match score"""
        if not predicted or not expected:
            return 0
        return 1.0 if predicted.strip().lower() == expected.strip().lower() else 0.0
    
    @staticmethod
    def contains_score(predicted, expected):
        """Check if predicted contains expected key information"""
        if not predicted or not expected:
            return 0
        predicted_lower = predicted.strip().lower()
        expected_lower = expected.strip().lower()
        
        # Simple containment check
        if expected_lower in predicted_lower:
            return 1.0
        
        # Check for key elements like numbers, dates
        expected_numbers = re.findall(r'\d+', expected)
        if expected_numbers:
            for num in expected_numbers:
                if num in predicted:
                    return 0.7  # Partial credit for containing key numbers
        
        return 0.0
    
    @staticmethod
    def semantic_similarity(predicted, expected):
        """Calculate cosine similarity between TF-IDF vectors"""
        if not predicted or not expected:
            return 0
        
        try:
            vectorizer = TfidfVectorizer().fit_transform([predicted, expected])
            vectors = vectorizer.toarray()
            cosine_sim = cosine_similarity(vectors)
            return cosine_sim[0, 1]
        except:
            return 0
    
    def comprehensive_score(self, predicted, expected):
        """Combined scoring metric"""
        exact_match = self.exact_match_score(predicted, expected)
        contains = self.contains_score(predicted, expected)
        semantic = self.semantic_similarity(predicted, expected)
        
        # Weighted combination
        return (exact_match * 0.4) + (contains * 0.3) + (semantic * 0.3)