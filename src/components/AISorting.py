import requests
import random

# Replace with your actual backend URL and port if different
url = "http://localhost:3000/group-words"

# Example word pool
word_pool = [
    "eat", "consume", "devour", "run", "sprint", "apple", "orange",
    "banana", "pear", "walk", "jog", "food", "cat", "dog", "mouse", "cheese"
]

# Pick a random sample of words (e.g., 8 words)
words = random.sample(word_pool, 8)

payload = {"words": words}
response = requests.post(url, json=payload)

#print("Input words:", words)
print("Status code:", response.status_code)
print("Raw response:", response.text)
print("Response:", response.json())