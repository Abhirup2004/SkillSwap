# generate_suggestions.py

import os
from pymongo import MongoClient
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ✅ Load .env for MONGO_URI
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# ✅ Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client.get_database()
users_collection = db["users"]

print("📡 Connected to MongoDB")

# ✅ Fetch users and prepare skill text
users = list(users_collection.find())
user_texts = []
user_ids = []
user_skills = []

for user in users:
    teach_skills = user.get("skillsToTeach", [])
    learn_skills = user.get("skillsToLearn", [])
    combined_text = " ".join(teach_skills + learn_skills)
    
    user_texts.append(combined_text.lower())
    user_ids.append(str(user["_id"]))
    user_skills.append(set(teach_skills + learn_skills))

# ✅ Vectorize skill text using TF-IDF
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(user_texts)

# ✅ Compute similarity matrix
similarity_matrix = cosine_similarity(tfidf_matrix)

# ✅ Generate and update suggestions for each user
for i, user_id in enumerate(user_ids):
    similarities = list(enumerate(similarity_matrix[i]))
    similarities = sorted(similarities, key=lambda x: x[1], reverse=True)

    # Skip self, pick top 5 similar users
    top_matches = [user_ids[idx] for idx, score in similarities if idx != i][:5]

    # Collect skills from similar users that the current user doesn't have
    suggested_skills = set()
    for idx, _ in similarities:
        if idx == i:
            continue
        other_user_skills = user_skills[idx]
        missing_skills = other_user_skills - user_skills[i]
        suggested_skills.update(missing_skills)
        if len(suggested_skills) >= 5:
            break

    top_skills = list(suggested_skills)[:5]

    users_collection.update_one(
        {"_id": users[i]["_id"]},
        {
            "$set": {
                "recommendedMatches": top_matches,
                "suggestedSkills": top_skills
            }
        }
    )
    print(f"✅ Updated user {user_id} with {len(top_matches)} matches and {len(top_skills)} skills")

print("🚀 Done generating skill & match recommendations.")
