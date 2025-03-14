from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pickle
import os
import json
import numpy as np
from collections import defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from send_invoice import generate_invoice_pdf, send_invoice_via_twilio, upload_to_dropbox

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class ProductRecommender:
    def __init__(self):
        self.product_data = {}
        self.vectorizer = None
        self.tfidf_matrix = None
        self.product_keys = []
        self.product_idx_map = {}
    
    # Get top selling products
    def get_top_selling_products(self, num_recommendations=12, exclude_barcodes=None):
        if exclude_barcodes is None:
            exclude_barcodes = []
        
        # Sort products by units_sold in descending order
        sorted_products = sorted(
            [p for barcode, p in self.product_data.items() if barcode not in exclude_barcodes],
            key=lambda x: x.get('units_sold', 0),
            reverse=True
        )
        
        # Create recommendation objects from top selling products
        recommendations = []
        for product in sorted_products[:num_recommendations]:
            recommendations.append({
                'barcode': product['barcode'],
                'similarity': 0.5,  # Default similarity for top selling products
                'category': product['category'],
                'sub_category': product.get('sub_category', ''),
                'price': product['price'],
                'units_sold': product.get('units_sold', 0),
                'name': product['name'],
                'imageUrl': product.get('imageUrl', '')
            })
        
        return recommendations[:num_recommendations]
    
    # Compute similarity with improved algorithm
    def get_similar_products(self, cart_barcodes, num_recommendations=12, 
                             max_per_category=3, similarity_threshold=0.1):
        # If cart is empty, return top selling products
        if not cart_barcodes:
            return self.get_top_selling_products(num_recommendations)
    
        cart_indices = [self.product_idx_map[barcode] for barcode in cart_barcodes if barcode in self.product_idx_map]
        
        # If no valid cart items were found, return top selling products
        if not cart_indices:
            return self.get_top_selling_products(num_recommendations)
    
        # Compute weighted cosine similarity for cart items
        cart_vectors = self.tfidf_matrix[cart_indices]
        cosine_sim = cosine_similarity(cart_vectors, self.tfidf_matrix)
        
        # Apply recency bias - more recent cart items have higher weight
        weights = np.linspace(0.8, 1.0, len(cart_indices))
        weighted_cosine_sim = np.average(cosine_sim, axis=0, weights=weights)
    
        recommended_products = []
        for i, score in enumerate(weighted_cosine_sim):
            barcode = self.product_keys[i]
            if barcode not in cart_barcodes:
                recommended_products.append({
                    'barcode': barcode,
                    'similarity': score,
                    'category': self.product_data[barcode]['category'],
                    'sub_category': self.product_data[barcode]['sub_category'],
                    'price': self.product_data[barcode]['price'],
                    'units_sold': self.product_data[barcode]['units_sold'],
                    'name': self.product_data[barcode]['name'],
                    'imageUrl': self.product_data[barcode].get('imageUrl', '')
                })
    
        # Improved boosting algorithm
        for rec in recommended_products:
            # Category match boost
            if self.product_data[rec['barcode']]['category'] in [self.product_data[b]['category'] for b in cart_barcodes]:
                rec['similarity'] *= 1.3
            
            # Sub-category match boost
            if self.product_data[rec['barcode']]['sub_category'] in [self.product_data[b].get('sub_category', '') for b in cart_barcodes]:
                rec['similarity'] *= 1.2
            
            # Popularity boost with diminishing returns
            popularity_boost = min(1 + (rec['units_sold'] / 1000), 1.5)  # Cap at 1.5x
            rec['similarity'] *= popularity_boost
            
            # Price range similarity boost
            cart_prices = [self.product_data[b]['price'] for b in cart_barcodes]
            avg_cart_price = sum(cart_prices) / len(cart_prices)
            price_ratio = min(rec['price'], avg_cart_price) / max(rec['price'], avg_cart_price)
            rec['similarity'] *= (0.7 + 0.3 * price_ratio)  # Price similarity accounts for up to 30% boost
    
        # Sigmoid normalization function to preserve meaningful score distribution
        def sigmoid_normalize(scores):
            return 1 / (1 + np.exp(-5 * (scores - 0.5)))
        
        if recommended_products:
            similarities = np.array([rec['similarity'] for rec in recommended_products])
            normalized = sigmoid_normalize(similarities / max(similarities))
            for i, rec in enumerate(recommended_products):
                rec['similarity'] = normalized[i]
    
        recommended_products.sort(key=lambda x: x['similarity'], reverse=True)
    
        # Ensure category diversity with improved algorithm
        category_counts = defaultdict(int)
        final_recommendations = []
        
        # First pass: select top items from different categories
        for rec in recommended_products:
            category = rec['category']
            if category_counts[category] < max_per_category:
                final_recommendations.append(rec)
                category_counts[category] += 1
    
            if len(final_recommendations) == num_recommendations:
                break
    
        # If we don't have enough recommendations yet, add more from the sorted list
        if len(final_recommendations) < num_recommendations:
            remaining_options = [rec for rec in recommended_products if rec not in final_recommendations]
            
            # Sort by similarity score
            remaining_options.sort(key=lambda x: x['similarity'], reverse=True)
            
            # Add remaining recommendations until we reach the desired number
            additional_needed = num_recommendations - len(final_recommendations)
            final_recommendations.extend(remaining_options[:additional_needed])
        
        # If we still don't have enough recommendations, add top selling products
        if len(final_recommendations) < num_recommendations:
            top_selling = self.get_top_selling_products(
                num_recommendations - len(final_recommendations),
                exclude_barcodes=cart_barcodes + [rec['barcode'] for rec in final_recommendations]
            )
            final_recommendations.extend(top_selling)
    
        # Ensure we return exactly the requested number of recommendations
        return final_recommendations[:num_recommendations]
    
    # Get recommendations for cart barcodes
    def recommend(self, cart_barcodes, num_recommendations=12):
        if not self.product_data or self.tfidf_matrix is None:
            return []
        
        recommendations = self.get_similar_products(cart_barcodes, num_recommendations=num_recommendations)
        return recommendations
    
    # Load model from pickle file
    @classmethod
    def load_model(cls, filename="recommender_model.pkl"):
        try:
            with open(filename, 'rb') as f:
                model_data = pickle.load(f)
            
            recommender = cls()
            recommender.product_data = model_data['product_data']
            recommender.vectorizer = model_data['vectorizer']
            recommender.tfidf_matrix = model_data['tfidf_matrix']
            recommender.product_keys = model_data['product_keys']
            recommender.product_idx_map = model_data['product_idx_map']
            
            print(f"Model loaded successfully from {filename}")
            return recommender
        except Exception as e:
            print(f"Error loading model: {e}")
            return None

# Global variable to store the recommender model
recommender = None

def load_recommender_model(model_path="recommender_model.pkl"):
    """Load the recommender model at application startup"""
    global recommender
    recommender = ProductRecommender.load_model(model_path)
    return recommender is not None

@app.route('/recommend', methods=['POST'])
def recommend_products():
    """API endpoint to get product recommendations based on cart items"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate input
        if not data or 'cart_barcodes' not in data:
            return jsonify({'error': 'Invalid request. Missing cart_barcodes field.'}), 400
        
        cart_barcodes = data['cart_barcodes']
        
        # Validate cart_barcodes is a list
        if not isinstance(cart_barcodes, list):
            return jsonify({'error': 'cart_barcodes must be a list of strings'}), 400
        
        # Get number of recommendations (optional parameter)
        num_recommendations = int(data.get('num_recommendations', 12))
        
        # Check if model is loaded
        global recommender
        if recommender is None:
            # Try to load the model
            if not load_recommender_model():
                return jsonify({'error': 'Recommender model not available'}), 500
        
        # Get recommendations
        recommendations = recommender.recommend(cart_barcodes, num_recommendations)
        
        # Return recommendations as JSON
        return jsonify({
            'success': True,
            'cart_barcodes': cart_barcodes,
            'num_recommendations': len(recommendations),
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/top-products', methods=['GET'])
def get_top_products():
    """API endpoint to get top selling products"""
    try:
        # Get number of products (optional parameter)
        num_products = request.args.get('num', default=12, type=int)
        
        # Check if model is loaded
        global recommender
        if recommender is None:
            # Try to load the model
            if not load_recommender_model():
                return jsonify({'error': 'Recommender model not available'}), 500
        
        # Get top selling products
        top_products = recommender.get_top_selling_products(num_products)
        
        # Return top products as JSON
        return jsonify({
            'success': True,
            'num_products': len(top_products),
            'products': top_products
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    global recommender
    return jsonify({
        'status': 'healthy',
        'model_loaded': recommender is not None
    })

@app.route('/generate-invoice', methods=['POST'])
def generate_invoice():
    """API endpoint to generate and send invoice PDF"""
    try:
        # Get JSON data from request
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request. Missing data.'}), 400

        # Validate required fields
        required_fields = ['userName', 'phone_number']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Generate the invoice PDF
        try:
            pdf_path = generate_invoice_pdf(data)
        except Exception as e:
            return jsonify({'error': f'Failed to generate PDF: {str(e)}'}), 500

        # Upload the PDF to Dropbox
        try:
            dropbox_link = upload_to_dropbox(pdf_path)
            if not dropbox_link:
                return jsonify({'error': 'Failed to generate Dropbox link'}), 500
        except Exception as e:
            return jsonify({'error': f'Failed to upload to Dropbox: {str(e)}'}), 500

        # Send the invoice via Twilio
        try:
            if data.get('phone_number') and dropbox_link:
                send_invoice_via_twilio(data['phone_number'], dropbox_link)
        except Exception as e:
            # Don't fail the whole request if SMS fails, just log the error
            print(f"Warning: Failed to send SMS: {str(e)}")

        # Return the file in the response
        return jsonify({
            'success': True,
            'message': 'Invoice generated and sent successfully',
            'download_link': dropbox_link
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load the model before starting the server
    model_path = os.environ.get('MODEL_PATH', 'recommender_model.pkl')
    
    print(f"Loading recommender model from {model_path}...")
    if load_recommender_model(model_path):
        print("Model loaded successfully!")
    else:
        print("WARNING: Failed to load model. API will attempt to load it on first request.")
    
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Start Flask app
    app.run(host='0.0.0.0', port=port, debug=False)