# embeddings.py
from sentence_transformers import SentenceTransformer
import numpy as np

class EmbeddingGenerator:
    def __init__(self):
        # Using a lightweight but effective model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def generate_embedding(self, text):
        return self.model.encode(text, convert_to_tensor=True)
