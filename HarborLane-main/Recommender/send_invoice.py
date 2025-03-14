import dropbox
from fpdf import FPDF
from twilio.rest import Client
from datetime import datetime
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

# --------------- CONFIGURATION ---------------
# Dropbox Access Token
DROPBOX_ACCESS_TOKEN = os.getenv('DROPBOX_ACCESS_TOKEN')

# PDF and Dropbox paths
PDF_FILE_NAME = "invoice.pdf"
LOCAL_FILE_PATH = f"./{PDF_FILE_NAME}"  # Local file path
DROPBOX_FILE_PATH = f"/{PDF_FILE_NAME}"  # Dropbox upload path

# Twilio configuration
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
messaging_service_sid = os.getenv('TWILIO_MESSAGING_SERVICE_SID')

# Company branding colors
PRIMARY_COLOR = (41, 128, 185)  # Blue
SECONDARY_COLOR = (39, 174, 96)  # Green
ACCENT_COLOR = (243, 156, 18)  # Orange
TEXT_COLOR = (52, 73, 94)  # Dark blue-gray

class PremiumInvoicePDF(FPDF):
    def __init__(self):
        super().__init__()
        self.WIDTH = 210
        self.HEIGHT = 297
        self.invoice_number = f"INV-{datetime.now().strftime('%Y%m')}-{str(uuid.uuid4())[:8].upper()}"
        
    def header(self):
        # Add a colored header band
        self.set_fill_color(*PRIMARY_COLOR)
        self.rect(0, 0, 210, 35, 'F')
        
        # Company logo and name
        self.set_font('Arial', 'B', 22)
        self.set_text_color(255, 255, 255)
        self.cell(130, 20, 'TheMart Supermarket', 0, 0, 'L')
        
        # Invoice title
        self.set_font('Arial', 'B', 18)
        self.set_text_color(255, 255, 255)
        self.cell(60, 20, 'INVOICE', 0, 1, 'R')
        
        # Powered by text
        self.set_font('Arial', 'I', 10)
        self.set_text_color(220, 220, 220)
        self.cell(130, 8, 'powered by HaborLane', 0, 0, 'L')
        
        # Invoice number and date
        self.set_font('Arial', '', 10)
        self.set_text_color(255, 255, 255)
        self.cell(60, 8, f'No: {self.invoice_number}', 0, 1, 'R')
        self.ln(10)
        
    def footer(self):
        # Footer bar
        self.set_y(-40)
        self.set_fill_color(*PRIMARY_COLOR)
        self.rect(0, self.HEIGHT - 35, 210, 35, 'F')
        
        # Thank you message
        self.set_y(-30)
        self.set_font('Arial', 'B', 10)
        self.set_text_color(255, 255, 255)
        self.cell(0, 6, 'Thank you for shopping with TheMart!', 0, 1, 'C')
        
        # Contact information
        self.set_font('Arial', '', 8)
        self.set_text_color(220, 220, 220)
        self.cell(0, 5, 'For any questions, please contact: support@themartnadiad.com | 022-68502300', 0, 1, 'C')
        
        # Page number
        self.set_font('Arial', 'I', 8)
        self.cell(0, 5, f'Page {self.page_no()}/{self.alias_nb_pages()}', 0, 0, 'C')
        
    def add_colored_section_header(self, title):
        """Adds a colored section header with the given title"""
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(*PRIMARY_COLOR)
        self.set_text_color(255, 255, 255)
        self.cell(0, 8, title, 0, 1, 'L', True)
        self.ln(3)
        
    def add_address_blocks(self, data):
        """Add from and to address blocks side by side"""
        # From Address (Company)
        self.set_font('Arial', 'B', 11)
        self.set_text_color(*TEXT_COLOR)
        self.cell(95, 7, 'FROM:', 0, 0, 'L')
        
        # To Address (Customer)
        self.cell(95, 7, 'BILL TO:', 0, 1, 'L')
        
        # Company details
        self.set_font('Arial', '', 9)
        self.cell(95, 5, 'TheMart Supermarket', 0, 0, 'L')
        
        # Customer name
        self.cell(95, 5, f"{data.get('userName', 'N/A')}", 0, 1, 'L')
        
        # Company address line 1
        self.cell(95, 5, '123 Business Street', 0, 0, 'L')
        
        # Customer phone
        self.cell(95, 5, f"Phone: {data.get('phone_number', 'N/A')}", 0, 1, 'L')
        
        # Company address line 2
        self.cell(95, 5, 'Nadiad, Gujarat, 387001', 0, 0, 'L')
        
        # Empty line for customer
        self.cell(95, 5, '', 0, 1, 'L')
        
        # Company phone
        self.cell(95, 5, 'Phone: 022-68502300', 0, 0, 'L')
        
        # Empty line for customer
        self.cell(95, 5, '', 0, 1, 'L')
        
        # Company email
        self.cell(95, 5, 'Email: info@themartnadiad.com', 0, 1, 'L')
        
        self.ln(5)
        
    def add_invoice_details(self, data):
        """Add invoice information section"""
        # Invoice information box
        self.add_colored_section_header('INVOICE INFORMATION')
        
        # Date, due date, payment status
        col_width = self.WIDTH / 3
        
        # Headers
        self.set_font('Arial', 'B', 9)
        self.set_text_color(*TEXT_COLOR)
        self.cell(col_width, 7, 'DATE', 1, 0, 'C')
        self.cell(col_width, 7, 'ORDER ID', 1, 0, 'C')
        self.cell(col_width, 7, 'PAYMENT STATUS', 1, 1, 'C')
        
        # Values
        self.set_font('Arial', '', 9)
        
        # Current date
        self.cell(col_width, 7, datetime.now().strftime("%d-%m-%Y"), 1, 0, 'C')
        
        # Order ID
        self.cell(col_width, 7, f"{data.get('razorpay_order_id', 'N/A')}", 1, 0, 'C')
        
        # Payment status with color
        status = data.get('payment_status', 'N/A')
        status_color = SECONDARY_COLOR if status.lower() == 'completed' else (231, 76, 60)  # Green if completed, red otherwise
        self.set_text_color(*status_color)
        self.cell(col_width, 7, status.upper(), 1, 1, 'C')
        
        # Reset text color
        self.set_text_color(*TEXT_COLOR)
        self.ln(5)
        
    def add_order_items(self, data):
        """Add order items table"""
        # Start order items section
        self.add_colored_section_header('ORDER DETAILS')
        
        # Table header
        self.set_font('Arial', 'B', 9)
        self.set_fill_color(240, 240, 240)
        self.set_text_color(*TEXT_COLOR)
        
        # Column widths
        col_widths = [10, 80, 30, 30, 40]
        
        # Header row
        self.cell(col_widths[0], 8, 'NO', 1, 0, 'C', True)
        self.cell(col_widths[1], 8, 'ITEM DESCRIPTION', 1, 0, 'C', True)
        self.cell(col_widths[2], 8, 'QTY', 1, 0, 'C', True)
        self.cell(col_widths[3], 8, 'PRICE', 1, 0, 'C', True)
        self.cell(col_widths[4], 8, 'AMOUNT', 1, 1, 'C', True)
        
        # Table content
        self.set_font('Arial', '', 9)
        
        if 'order_items' in data and data['order_items']:
            for i, item in enumerate(data['order_items'], 1):
                item_name = item.get('product_name', 'Product')
                quantity = item.get('quantity', 1)
                price = item.get('price', 0)
                amount = price * quantity
                
                # Alternate row colors for better readability
                fill = i % 2 == 0
                fill_color = (245, 245, 245) if fill else (255, 255, 255)
                self.set_fill_color(*fill_color)
                
                self.cell(col_widths[0], 7, str(i), 1, 0, 'C', fill)
                self.cell(col_widths[1], 7, item_name, 1, 0, 'L', fill)
                self.cell(col_widths[2], 7, str(quantity), 1, 0, 'C', fill)
                self.cell(col_widths[3], 7, f'Rs. {price:,.2f}', 1, 0, 'R', fill)
                self.cell(col_widths[4], 7, f'Rs. {amount:,.2f}', 1, 1, 'R', fill)
        else:
            self.cell(sum(col_widths), 7, 'No items found', 1, 1, 'C')
        
        self.ln(5)
        
    def add_cart_totals(self, data):
        """Add individual cart totals"""
        if 'total_amount_per_cart' in data and data['total_amount_per_cart']:
            # Add section header
            if len(data['total_amount_per_cart']) > 1:
                self.add_colored_section_header('CART SUMMARY')
            
            # Summary table
            self.set_font('Arial', 'B', 9)
            self.set_fill_color(240, 240, 240)
            
            if len(data['total_amount_per_cart']) > 1:
                # Show cart summary only if there are multiple carts
                self.cell(90, 7, 'CART', 1, 0, 'C', True)
                self.cell(90, 7, 'AMOUNT', 1, 1, 'C', True)
                
                self.set_font('Arial', '', 9)
                for cart_number, cart_total in data['total_amount_per_cart'].items():
                    self.cell(90, 7, f'Cart {cart_number}', 1, 0, 'L')
                    self.cell(90, 7, f'Rs. {cart_total:,.2f}', 1, 1, 'R')
                
                self.ln(5)
        
    def add_payment_summary(self, data):
        """Add payment totals and summary"""
        # Get the total amount
        total = data.get('amount', 0)
        
        # Calculate additional values
        subtotal = total
        tax_rate = 0.18  # 18% GST (example)
        tax_amount = round(subtotal * tax_rate / (1 + tax_rate), 2)  # Calculate tax from inclusive amount
        net_amount = subtotal - tax_amount
        
        # Create payment summary section
        self.add_colored_section_header('PAYMENT SUMMARY')
        
        # Summary box - right aligned
        summary_width = 95
        left_margin = self.WIDTH - summary_width - 10
        
        # Position cursor
        self.set_x(left_margin)
        
        # Net amount
        self.set_font('Arial', '', 9)
        self.cell(summary_width/2, 7, 'Net Amount:', 'LT', 0, 'L')
        self.cell(summary_width/2, 7, f'Rs. {net_amount:,.2f}', 'TR', 1, 'R')
        
        # Tax
        self.set_x(left_margin)
        self.cell(summary_width/2, 7, f'GST ({int(tax_rate*100)}%):', 'L', 0, 'L')
        self.cell(summary_width/2, 7, f'Rs. {tax_amount:,.2f}', 'R', 1, 'R')
        
        # Subtotal
        self.set_x(left_margin)
        self.set_font('Arial', 'B', 10)
        self.cell(summary_width/2, 8, 'TOTAL AMOUNT:', 'LB', 0, 'L')
        self.set_text_color(*PRIMARY_COLOR)
        self.cell(summary_width/2, 8, f'Rs. {total:,.2f}', 'RB', 1, 'R')
        
        # Reset text color
        self.set_text_color(*TEXT_COLOR)
        
        # Payment details
        self.ln(5)
        self.set_font('Arial', 'B', 9)
        self.cell(40, 5, 'Payment ID:', 0, 0, 'L')
        self.set_font('Arial', '', 9)
        self.cell(0, 5, f"{data.get('razorpay_payment_id', 'N/A')}", 0, 1, 'L')
        
    def add_terms_and_notes(self):
        """Add terms, notes and QR code"""
        # Terms section
        self.ln(8)
        self.add_colored_section_header('TERMS & CONDITIONS')
        
        self.set_font('Arial', '', 8)
        self.multi_cell(0, 4, (
            "1. All items must be returned within 7 days with original receipt for full refund.\n"
            "2. Perishable items cannot be returned once purchased.\n"
            "3. For electronics, original packaging and all accessories must be intact.\n"
            "4. We reserve the right to verify payments and transactions.\n"
            "5. For any questions or concerns, please contact customer service."
        ), 0, 'L')
        
        # Notes section if needed
        self.ln(5)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 5, 'This is a computer-generated invoice and does not require a signature.', 0, 1, 'C')

def generate_invoice_pdf(data):
    """Generates a professionally designed invoice PDF based on the provided data."""
    try:
        # Initialize PDF
        pdf = PremiumInvoicePDF()
        pdf.alias_nb_pages()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=40)  # Set larger margin for footer
        
        # Add content sections
        pdf.add_address_blocks(data)
        pdf.add_invoice_details(data)
        pdf.add_order_items(data)
        pdf.add_payment_summary(data)
        pdf.add_terms_and_notes()
        
        # Save the PDF
        pdf_filename = f"invoice_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        pdf_path = os.path.join(os.getcwd(), pdf_filename)
        pdf.output(pdf_path)
        
        print(f"✅ Premium PDF Created: {pdf_path}")
        return pdf_path
        
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        raise

def upload_to_dropbox(local_file_path):
    """Uploads the PDF to Dropbox and returns a direct download link."""
    try:
        dbx = dropbox.Dropbox(DROPBOX_ACCESS_TOKEN)
        dropbox_path = f"/{os.path.basename(local_file_path)}"
        
        # Upload the file (overwrite if it already exists)
        with open(local_file_path, "rb") as file:
            dbx.files_upload(file.read(), dropbox_path, mode=dropbox.files.WriteMode("overwrite"))
        
        # Check for existing shared link or create a new one
        try:
            shared_links = dbx.sharing_list_shared_links(path=dropbox_path).links
            if shared_links:
                shared_link = shared_links[0].url  # Use the existing link
            else:
                # Create a new link if not found
                shared_link_metadata = dbx.sharing_create_shared_link_with_settings(dropbox_path)
                shared_link = shared_link_metadata.url
        except Exception as e:
            print(f"❌ Error retrieving Dropbox link: {e}")
            return None
        
        # Convert to direct download link
        direct_link = shared_link.replace("?dl=0", "?dl=1")
        print(f"✅ File uploaded to Dropbox: {direct_link}")
        return direct_link
        
    except Exception as e:
        print(f"❌ Error uploading to Dropbox: {e}")
        raise

def send_invoice_via_twilio(phone_number, dropbox_link):
    """Sends the invoice link via Twilio SMS."""
    try:
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Format phone number correctly - add country code if not present
        if not phone_number.startswith('+'):
            # Assuming Indian numbers by default
            formatted_number = f'+91{phone_number}' if not phone_number.startswith('91') else f'+{phone_number}'
        else:
            formatted_number = phone_number
        
        # Send SMS with invoice link
        message = client.messages.create(
            messaging_service_sid=messaging_service_sid,
            body=f'Thank you for shopping with TheMart! Your invoice can be downloaded at: {dropbox_link}',
            to=formatted_number
        )
        
        print(f"✅ SMS sent successfully to {formatted_number}. Message SID: {message.sid}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending SMS: {e}")
        raise

# Test function for direct execution
if __name__ == "__main__":
    # Test data with multiple carts
    test_data = {
        "userName": "Test User",
        "phone_number": "8238327914",
        "razorpay_order_id": "order_123456",
        "razorpay_payment_id": "pay_123456",
        "payment_status": "completed",
        "amount": 1500,
        "order_items": [
            {"product_name": "Tata Salt", "quantity": 2, "price": 20},
            {"product_name": "Aashirvaad Atta", "quantity": 1, "price": 250},
            {"product_name": "Surf Excel", "quantity": 1, "price": 160},
            {"product_name": "Fortune Oil", "quantity": 2, "price": 210},
            {"product_name": "Amul Butter", "quantity": 3, "price": 50}
        ],
        "total_amount_per_cart": {"1": 500, "2": 600, "3": 400}
    }
    
    try:
        # Generate PDF
        pdf_path = generate_invoice_pdf(test_data)
        
        # Upload to Dropbox
        dropbox_link = upload_to_dropbox(pdf_path)
        
        # Send SMS
        if dropbox_link:
            send_invoice_via_twilio(test_data["phone_number"], dropbox_link)
        
    except Exception as e:
        print(f"❌ Error in test execution: {e}")