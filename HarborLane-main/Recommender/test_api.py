import requests
import json

def test_recommend_endpoint():
    """Test the /recommend endpoint"""
    url = "http://localhost:5000/recommend"
    
    # Test with sample cart
    payload = {
        "cart_barcodes": ["505628956376", "443957769084", "167540820391"],
        "num_recommendations": 10
    }
    
    # Make POST request
    response = requests.post(url, json=payload)
    
    # Print results
    print("Status Code:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        print(f"Got {data['num_recommendations']} recommendations")
        
        # Print top 3 recommendations
        print("\nTop 3 recommendations:")
        for i, rec in enumerate(data['recommendations'][:3], 1):
            print(f"{i}. {rec['name']} - Similarity: {rec['similarity']:.4f}")
    else:
        print("Error:", response.text)
    
    # Test with empty cart
    empty_payload = {
        "cart_barcodes": []
    }
    
    # Make POST request for empty cart
    empty_response = requests.post(url, json=empty_payload)
    
    # Print results
    print("\nEmpty Cart Test:")
    print("Status Code:", empty_response.status_code)
    if empty_response.status_code == 200:
        data = empty_response.json()
        print(f"Got {data['num_recommendations']} recommendations for empty cart")
    else:
        print("Error:", empty_response.text)

def test_top_products_endpoint():
    """Test the /top-products endpoint"""
    url = "http://localhost:5000/top-products?num=5"
    
    # Make GET request
    response = requests.get(url)
    
    # Print results
    print("\nTop Products Test:")
    print("Status Code:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        print(f"Got {data['num_products']} top products")
        
        # Print top products
        for i, product in enumerate(data['products'], 1):
            print(f"{i}. {product['name']} - Units Sold: {product['units_sold']}")
    else:
        print("Error:", response.text)

def test_health_endpoint():
    """Test the /health endpoint"""
    url = "http://localhost:5000/health"
    
    # Make GET request
    response = requests.get(url)
    
    # Print results
    print("\nHealth Check Test:")
    print("Status Code:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        print(f"Status: {data['status']}")
        print(f"Model loaded: {data['model_loaded']}")
    else:
        print("Error:", response.text)

if __name__ == "__main__":
    print("Testing Product Recommender API...")
    test_recommend_endpoint()
    test_top_products_endpoint()
    test_health_endpoint()