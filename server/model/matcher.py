#matcher.py
from concurrent.futures import ThreadPoolExecutor
import asyncio
import aiohttp
from typing import Dict, List
import numpy as np
from .cache import Cache
from .embeddings import EmbeddingGenerator
import logging

#logging.basicConfig(level=logging.INFO)

class IssueMatcher:
    def __init__(self):
        self.cache = Cache()
        self.embedding_generator = EmbeddingGenerator()
        self.max_workers = 5
        self.semaphore = asyncio.Semaphore(10)  # Limit concurrent requests
    
    async def download_file_content(self, session, file):
        if not file.get('download_url'):
            logging.warning(f"Skipping file without URL: {file.get('path', 'Unknown')}")
            return None
        try:
            async with self.semaphore:  # Prevent excessive concurrent requests
                async with session.get(file['download_url'], timeout=5) as response:
                    if response.status == 200:
                        content = await response.text()
                        return {'path': file['path'], 'content': content, 'download_url': file['download_url']}
                    logging.error(f"Failed to download {file['path']} (HTTP {response.status})")
        except asyncio.TimeoutError:
            logging.error(f"Timeout when downloading {file['path']}")
        except Exception as e:
            logging.exception(f"Error downloading {file['path']}: {e}")
        return None

    async def fetch_all_files(self, files):
        async with aiohttp.ClientSession() as session:
            tasks = [self.download_file_content(session, file) for file in files]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            return [r for r in results if r]

    def preprocess_content(self, content: str) -> str:
        """
        Preprocess text by converting to lowercase and removing short words.
        """
        content = content.lower()
        return ' '.join(word for word in content.split() if len(word) > 2 or word.isalnum())

    def calculate_similarity(self, vec1, vec2):
        """
        Compute cosine similarity between two vectors.
        """
        try:
            return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))
        except ZeroDivisionError:
            return 0.0

    async def match_files(self, issue_data: Dict, filtered_files: List[Dict]) -> Dict:
        """
        Match files to the issue based on similarity scores.
        """
        try:
            # Check cache first
            cache_key = self.cache.get_cache_key({
                'issue': issue_data,
                'files': [f['path'] for f in filtered_files]
            })
            
            cached_result = self.cache.get(cache_key)
            if cached_result:
                logging.info("Returning cached result")
                return cached_result

            # Process issue text
            issue_text = f"{issue_data['title']} {issue_data.get('description', '')}"
            issue_embedding = self.embedding_generator.generate_embedding(issue_text)

            # Fetch file contents
            file_contents = await self.fetch_all_files(filtered_files)
            if not file_contents:
                logging.warning("No valid files to analyze")
                return {"status": "error", "message": "No valid files to analyze"}

            # Process files in parallel
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                file_embeddings = list(executor.map(
                    lambda x: {
                        'path': x['path'],
                        'embedding': self.embedding_generator.generate_embedding(
                            self.preprocess_content(x['content'])
                        ),
                        'download_url': x['download_url']
                    },
                    file_contents
                ))

            # Calculate similarities
            matches = []
            for file_data in file_embeddings:
                similarity = self.calculate_similarity(
                    issue_embedding.cpu().numpy(),
                    file_data['embedding'].cpu().numpy()
                )
                if similarity > 0.1:  # Minimum threshold
                    matches.append({
                        "file_name": file_data['path'],
                        "match_score": round(similarity, 2),
                        "download_url": file_data['download_url']
                    })

            # Sort and return results
            matches.sort(key=lambda x: x['match_score'], reverse=True)
            result = {
                "filename_matches": matches[:]
            }

            # Cache the result
            self.cache.set(cache_key, result)
            return result

        except Exception as e:
            logging.exception("Error in match_files")
            return {"status": "error", "message": str(e)}

