# Sample Python code for the recommendation system

from sklearn.decomposition import TruncatedSVD
import numpy as np

# Mock data
users = ["user1", "user2"]
products = ["bamboo_bottle", "plastic_bottle", "eco_tote", "snack_bar"]
carbon_scores = {"bamboo_bottle": 10, "plastic_bottle": 50, "eco_tote": 15, "snack_bar": 20}
user_history = np.array([[1, 0, 1, 0], [0, 1, 0, 1]])  # User-item matrix
recent_activity = {"user1": "snack_bar"}  # Recent views

# Step 1: Collaborative Filtering
svd = TruncatedSVD(n_components=2)
user_features = svd.fit_transform(user_history)
item_features = svd.components_.T
relevance_scores = user_features.dot(item_features.T)

# Step 2: Normalize carbon scores (lower is better)
max_carbon = max(carbon_scores.values())
norm_carbon = {p: 1 - (carbon_scores[p] / max_carbon) for p in products}

# Step 3: Re-rank with carbon scores
alpha = 0.7
final_scores = {}
for i, user in enumerate(users):
    scores = {}
    for j, product in enumerate(products):
        relevance = relevance_scores[i][j]
        carbon_factor = norm_carbon[product]
        scores[product] = alpha * relevance + (1 - alpha) * carbon_factor
    final_scores[user] = scores

# Step 4: Boost based on activity
for user, viewed in recent_activity.items():
    if viewed in final_scores[user]:
        final_scores[user][viewed] += 0.1  # Small boost

# Output recommendations
for user, scores in final_scores.items():
    top_product = max(scores, key=scores.get)
    print(f"{user}: Recommend {top_product} (Score: {scores[top_product]:.2f})")