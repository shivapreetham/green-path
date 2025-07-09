import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors

# Mock data: products with carbon scores
data = {
    'product': ['Milk A', 'Milk B', 'Bread A', 'Bread B'],
    'category': ['Dairy', 'Dairy', 'Bakery', 'Bakery'],
    'carbon_score': [2.5, 1.8, 3.0, 2.2],  # Lower is better
    'price': [2.99, 3.49, 1.99, 2.29]
}
df = pd.DataFrame(data)

# Customer's cart
cart = ['Milk A', 'Bread A']

# ML model to find similar products with lower carbon scores
def recommend_greener(cart, df):
    features = df[['carbon_score', 'price']].values
    nbrs = NearestNeighbors(n_neighbors=2, algorithm='auto').fit(features)
    recommendations = []
    
    for item in cart:
        item_idx = df.index[df['product'] == item].tolist()[0]
        distances, indices = nbrs.kneighbors([features[item_idx]])
        # Find a greener alternative in the same category
        category = df.loc[item_idx, 'category']
        alternatives = df[(df['category'] == category) & (df.index != item_idx)]
        greener = alternatives.loc[alternatives['carbon_score'].idxmin()]
        recommendations.append((item, greener['product'], greener['carbon_score']))
    return recommendations

# Test the recommendation
recs = recommend_greener(cart, df)
for original, greener, score in recs:
    print(f"Swap {original} for {greener} (Carbon Score: {score})")

# Calculate savings (simplified)
original_score = sum(df[df['product'].isin(cart)]['carbon_score'])
new_score = sum([score for _, _, score in recs])
savings = original_score - new_score
print(f"Carbon savings: {savings:.2f} units")