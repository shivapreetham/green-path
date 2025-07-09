import pandas as pd
import numpy as np

# Define packaging carbon footprint values
packaging_cf_dict = {"Plastic": 2, "Cardboard": 1, "Glass": 3}  # in kg CO2
emission_factor = 0.1  # kg CO2 per km for transportation

# Haversine function to calculate distance between two lat-long points
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)
    a = np.sin(delta_phi / 2)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    distance = R * c
    return distance

# Create sample dataframe
data = {
    'Product_ID': [1, 2, 3, 4, 5],
    'Product_Name': ['Apple', 'Banana', 'T-shirt', 'Laptop', 'Jeans'],
    'Genre': ['Food', 'Food', 'Clothing', 'Electronics', 'Clothing'],
    'Base_Carbon_Footprint': [5.0, 4.5, 3.0, 10.0, 2.8],  # kg CO2 from production/ingredients
    'Packaging_Type': ['Plastic', 'Cardboard', 'Plastic', 'Cardboard', 'Plastic'],
    'Latitude': [40.7128, 34.0522, 37.7749, 37.7749, 34.0522],  # New York, Los Angeles, San Francisco
    'Longitude': [-74.0060, -118.2437, -122.4194, -122.4194, -118.2437]
}
df = pd.DataFrame(data)

# Consumer location (e.g., Las Vegas)
consumer_location = (36.1699, -115.1398)

# Function to calculate total carbon footprint
def calculate_total_cf(row, consumer_location):
    base_cf = row['Base_Carbon_Footprint']
    packaging_cf = packaging_cf_dict[row['Packaging_Type']]
    distance = haversine(row['Latitude'], row['Longitude'], consumer_location[0], consumer_location[1])
    transportation_cf = emission_factor * distance
    total_cf = base_cf + packaging_cf + transportation_cf
    return total_cf

# Add total carbon footprint to dataframe
df['Total_Carbon_Footprint'] = df.apply(lambda row: calculate_total_cf(row, consumer_location), axis=1)

# Recommendation function
def recommend_products(genre, consumer_location, df, top_n=3):
    candidates = df[df['Genre'] == genre].copy()
    candidates['Total_Carbon_Footprint'] = candidates.apply(
        lambda row: calculate_total_cf(row, consumer_location), axis=1
    )
    recommendations = candidates.sort_values('Total_Carbon_Footprint').head(top_n)
    return recommendations[['Product_Name', 'Total_Carbon_Footprint', 'Latitude', 'Longitude']]

# Example: Recommend Food products
food_recommendations = recommend_products('Food', consumer_location, df)
print("Recommendations for 'Food' genre:")
print(food_recommendations)