from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import requests
import os
import re
import hashlib
import shutil
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image
import pytesseract
import PyPDF2
import openai
import urllib.request
from io import BytesIO
import seaborn as sns
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
import base64

# API request details
DEEPINFRA_API_KEY = 'shCB7ORblguQauKofulSXZ3HVz04AXtb'
MODEL_URL = 'https://api.deepinfra.com/v1/inference/google/gemma-2-9b-it'
HEADERS = {
    'Authorization': f'Bearer {DEEPINFRA_API_KEY}',
    'Content-Type': 'application/json',
}

# OpenAI API Key
openai.api_key = "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"

class AnalyticsHelper:
    def __init__(self):
        self.style_config = {
            'figure.figsize': (12, 8),
            'axes.titlesize': 14,
            'axes.labelsize': 12,
            'xtick.labelsize': 10,
            'ytick.labelsize': 10,
            'lines.linewidth': 2,
            'axes.grid': True,
            'grid.alpha': 0.3
        }
        plt.style.use('seaborn')
        for key, value in self.style_config.items():
            plt.rcParams[key] = value

    def predict_future_values(self, data: pd.DataFrame, x_col: str, y_col: str, periods: int = 12) -> tuple:
        """Generate predictions using polynomial regression"""
        X = pd.to_numeric(data[x_col])
        y = pd.to_numeric(data[y_col])
        
        # Create polynomial features
        poly = PolynomialFeatures(degree=2)
        X_poly = poly.fit_transform(X.values.reshape(-1, 1))
        
        # Fit polynomial regression
        model = LinearRegression()
        model.fit(X_poly, y)
        
        # Generate future dates/periods
        last_x = X.iloc[-1]
        future_x = np.arange(last_x + 1, last_x + periods + 1)
        future_x_poly = poly.transform(future_x.reshape(-1, 1))
        
        # Make predictions
        predictions = model.predict(future_x_poly)
        
        return future_x, predictions

    def create_interactive_trend_plot(self, data: pd.DataFrame, x_col: str, y_col: str, 
                                    title: str, include_prediction: bool = True) -> str:
        """Create an interactive trend plot with optional predictions"""
        fig = go.Figure()

        # Plot actual data
        fig.add_trace(go.Scatter(
            x=data[x_col],
            y=data[y_col],
            mode='lines+markers',
            name='Actual Data',
            line=dict(color='blue')
        ))

        if include_prediction:
            future_x, predictions = self.predict_future_values(data, x_col, y_col)
            
            # Add prediction interval
            fig.add_trace(go.Scatter(
                x=future_x,
                y=predictions,
                mode='lines',
                name='Prediction',
                line=dict(color='red', dash='dash')
            ))

        fig.update_layout(
            title=title,
            xaxis_title=x_col,
            yaxis_title=y_col,
            hovermode='x unified'
        )

        # Save as HTML file
        save_path = f"interactive_trend_{hashlib.md5(title.encode()).hexdigest()[:8]}.html"
        fig.write_html(save_path)
        return save_path

    def create_heatmap(self, data: pd.DataFrame, title: str) -> str:
        """Create a correlation heatmap"""
        plt.figure(figsize=(12, 8))
        numeric_data = data.select_dtypes(include=[np.number])
        sns.heatmap(numeric_data.corr(), annot=True, cmap='coolwarm', center=0)
        plt.title(title)
        
        save_path = f"heatmap_{hashlib.md5(title.encode()).hexdigest()[:8]}.png"
        plt.savefig(save_path, bbox_inches='tight', dpi=300)
        plt.close()
        return save_path

    def create_multi_line_plot(self, data: pd.DataFrame, x_col: str, y_cols: list, title: str) -> str:
        """Create a multi-line plot with multiple metrics"""
        fig = go.Figure()

        for col in y_cols:
            fig.add_trace(go.Scatter(
                x=data[x_col],
                y=data[col],
                mode='lines+markers',
                name=col
            ))

        fig.update_layout(
            title=title,
            xaxis_title=x_col,
            yaxis_title='Values',
            hovermode='x unified'
        )

        save_path = f"multi_line_{hashlib.md5(title.encode()).hexdigest()[:8]}.html"
        fig.write_html(save_path)
        return save_path

    def create_statistical_summary(self, data: pd.DataFrame, title: str) -> str:
        """Create a statistical summary visualization"""
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Distribution', 'Box Plot', 'Trend', 'Monthly Average')
        )

        numeric_cols = data.select_dtypes(include=[np.number]).columns
        main_col = numeric_cols[0]  # Use first numeric column for visualization

        # Distribution plot
        fig.add_trace(
            go.Histogram(x=data[main_col], name='Distribution'),
            row=1, col=1
        )

        # Box plot
        fig.add_trace(
            go.Box(y=data[main_col], name='Box Plot'),
            row=1, col=2
        )

        # Trend plot
        fig.add_trace(
            go.Scatter(x=data.index, y=data[main_col], name='Trend'),
            row=2, col=1
        )

        # Monthly average
        if isinstance(data.index, pd.DatetimeIndex):
            monthly_avg = data[main_col].resample('M').mean()
            fig.add_trace(
                go.Bar(x=monthly_avg.index, y=monthly_avg.values, name='Monthly Avg'),
                row=2, col=2
            )

        fig.update_layout(height=800, title_text=title, showlegend=False)
        
        save_path = f"statistical_summary_{hashlib.md5(title.encode()).hexdigest()[:8]}.html"
        fig.write_html(save_path)
        return save_path

class PDFTracker:
    def __init__(self):
        self.project_downloads = os.path.join(os.getcwd(), "downloads")
        os.makedirs(self.project_downloads, exist_ok=True)
        self.processed_messages = set()
        self.pdf_contents = {}  # Store PDF contents for querying
        
    def generate_message_id(self, message_element):
        try:
            timestamp = message_element.find_element(By.XPATH, ".//div[@data-pre-plain-text]").get_attribute("data-pre-plain-text")
            message_content = message_element.text
            message_string = f"{timestamp}{message_content}"
            return hashlib.md5(message_string.encode()).hexdigest()
        except:
            return hashlib.md5(message_element.get_attribute('innerHTML').encode()).hexdigest()
    
    def is_message_processed(self, message_element):
        message_id = self.generate_message_id(message_element)
        return message_id in self.processed_messages
    
    def mark_message_processed(self, message_element):
        message_id = self.generate_message_id(message_element)
        self.processed_messages.add(message_id)
    
    def save_pdf_to_project(self, original_path, filename=None):
        try:
            if not filename:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"pdf_{timestamp}.pdf"
            
            if not filename.lower().endswith('.pdf'):
                filename += '.pdf'
            
            dest_path = os.path.join(self.project_downloads, filename)
            shutil.copy2(original_path, dest_path)
            print(f"PDF saved to project: {dest_path}")
            return dest_path
        except Exception as e:
            print(f"Error saving PDF to project: {e}")
            return None
    
    def store_pdf_content(self, filename, content):
        """Store PDF content for later querying"""
        self.pdf_contents[filename] = content
    
    def get_recent_pdf_content(self):
        """Get most recent PDF content"""
        if self.pdf_contents:
            return list(self.pdf_contents.values())[-1]
        return None
        
# Function to extract text from PDF
def extract_text_from_pdf(file_path):
    """Extract text from PDF with detailed logging"""
    print(f"\n{'='*50}")
    print(f"Attempting to read PDF: {file_path}")
    try:
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            print(f"PDF has {len(reader.pages)} pages")
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                text += page_text
                print(f"\nPage {i+1} content preview: {page_text[:200]}...")
            print(f"\nFull PDF text extracted successfully")
            print(f"{'='*50}\n")
            return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        print(f"{'='*50}\n")
        return None

# Function to extract text from image using OCR
def extract_text_from_image(file_path):
    image = Image.open(file_path)
    text = pytesseract.image_to_string(image)
    return text

# Function to clean and structure data
def clean_data(text):
    lines = text.split("\n")
    data = [line.split() for line in lines if line.strip()]
    df = pd.DataFrame(data, columns=["Column1", "Column2", "Column3"])  # Adjust columns as needed
    return df

# Function to generate sales chart
def generate_sales_chart(df):
    plt.figure(figsize=(10, 6))
    plt.plot(df["Column1"], df["Column2"], marker='o')  # Adjust columns as needed
    plt.title("Monthly Sales")
    plt.xlabel("Date")
    plt.ylabel("Sales")
    plt.savefig("sales_chart.png")
    return "sales_chart.png"

# Function to update submain and temp_reference files
def update_submain_and_temp_reference(person_name):
    main_file_path = f"People/{person_name}/main.txt"
    submain_file_path = f"People/{person_name}/submain.txt"
    temp_reference_path = f"People/{person_name}/temp_reference.txt"
    
    with open(main_file_path, 'r', encoding='utf-8') as main_file:
        main_content = main_file.read()
    
    beginning_part = main_content[:1000]
    last_tokens = main_content[-1000:]
    submain_content = f"{beginning_part}{last_tokens}"

    with open(submain_file_path, "w", encoding='utf-8') as submain_file:
        submain_file.write(submain_content)
    
    with open(temp_reference_path, "w", encoding='utf-8') as temp_reference_file:
        temp_reference_file.write(submain_content)

    print(f"Updated {submain_file_path} and {temp_reference_path} with context.")

def wait_for_element_presence(driver, xpath, timeout=20):
    """Wait for an element to be present and return it"""
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )
        return element
    except Exception as e:
        print(f"Element not found: {xpath}")
        print(f"Error: {e}")
        return None

def find_chat_element(driver, target_chat):
    """Try multiple selectors to find the chat"""
    possible_xpaths = [
        f"//span[@title='{target_chat}']",
        f"//div[@title='{target_chat}']",
        f"//span[contains(@title, '{target_chat}')]",
        f"//div[contains(@title, '{target_chat}')]",
        f"//span[text()='{target_chat}']"
    ]
    
    for xpath in possible_xpaths:
        try:
            element = wait_for_element_presence(driver, xpath)
            if element and element.is_displayed():
                return element
        except Exception as e:
            continue
    
    return None

# Function to remove emojis from text
def remove_emojis(text):
    emoji_pattern = re.compile(
        '['
        '\U0001F600-\U0001F64F'  # Emoticons
        '\U0001F300-\U0001F5FF'  # Misc Symbols and Pictographs
        '\U0001F680-\U0001F6FF'  # Transport and Map Symbols
        '\U0001F700-\U0001F77F'  # Alchemical Symbols
        '\U0001F780-\U0001F7FF'  # Geometric Shapes Extended
        '\U0001F800-\U0001F8FF'  # Supplemental Arrows-C
        '\U0001F900-\U0001F9FF'  # Supplemental Symbols and Pictographs
        '\U0001FA00-\U0001FA6F'  # Chess Symbols
        '\U0001FA70-\U0001FAFF'  # Symbols and Pictographs Extended-A
        '\U00002702-\U000027B0'  # Dingbats
        '\U000024C2-\U0001F251'  # Enclosed Characters
        ']+',
        flags=re.UNICODE
    )
    return emoji_pattern.sub(r'', text)

# Function to get the last message time
def get_last_message_time():
    time_xpath = "//span[@class='x1rg5ohu x16dsc37']"
    message_times = driver.find_elements(By.XPATH, time_xpath)
    if message_times:
        return message_times[-1].text
    return None

# Function to send a message to WhatsApp
def send_message_to_whatsapp(message, media_path=None):
    try:
        message_input_xpath = "//div[@role='textbox' and contains(@aria-placeholder, 'Type a message')]"
        message_input = driver.find_element(By.XPATH, message_input_xpath)
        
        # Send the main message
        message_input.send_keys(message)
        
        # Handle media file if present
        if media_path:
            if media_path.endswith('.html'):
                # Convert HTML to PNG using selenium
                temp_driver = webdriver.Chrome(service=service, options=options)
                temp_driver.get(f"file://{os.path.abspath(media_path)}")
                time.sleep(2)  # Wait for rendering
                
                # Take screenshot
                png_path = media_path.replace('.html', '.png')
                temp_driver.save_screenshot(png_path)
                temp_driver.quit()
                
                # Send the PNG
                attach_button = driver.find_element(By.XPATH, "//div[@title='Attach']")
                attach_button.click()
                time.sleep(1)
                file_input = driver.find_element(By.XPATH, "//input[@type='file']")
                file_input.send_keys(os.path.abspath(png_path))
            else:
                # Send other media types directly
                attach_button = driver.find_element(By.XPATH, "//div[@title='Attach']")
                attach_button.click()
                time.sleep(1)
                file_input = driver.find_element(By.XPATH, "//input[@type='file']")
                file_input.send_keys(os.path.abspath(media_path))
            
            time.sleep(2)
            
        message_input.send_keys(Keys.ENTER)
        print(f"Message sent: {message}")
        
    except Exception as e:
        print(f"Error sending message: {e}")

# Function to get AI response
def get_ai_response(user_message):
    person_name = target_chat
    update_submain_and_temp_reference(person_name)
    
    conversation_history = "<start_of_turn>user\n <start_of_turn>model\n"
    with open(f"People/{person_name}/submain.txt", "r") as sub_main_file:
        conversation_history += sub_main_file.read()
    conversation_history += f"<start_of_turn>user\n{user_message}<end_of_turn>\n<start_of_turn>model\n"
    
    data = {
        "input": conversation_history,
        "stop": ["<eos>", "<end_of_turn>"]
    }

    response = requests.post(MODEL_URL, json=data, headers=HEADERS)
    if response.status_code == 200:
        res = response.json()
        model_response = res['results'][0]['generated_text'].strip()
        model_response = model_response.replace("\n", " ")
        model_response = remove_emojis(model_response)
        return model_response
    return None

# Function to append conversation to history
def append_to_conversation_history(person_name, user_message, ai_response):
    person_folder = os.path.join("People", person_name)
    if not os.path.exists(person_folder):
        os.makedirs(person_folder)

    person_file_path = os.path.join(person_folder, "main.txt")
    conversation_entry = f"<start_of_turn>user\n{user_message}\n<end_of_turn>\n"
    conversation_entry += f"<start_of_turn>model\n{ai_response}\n<end_of_turn>\n"

    with open(person_file_path, 'a', encoding='utf-8') as file:
        file.write(conversation_entry)

def download_file(url, download_path):
    """Download a file from WhatsApp Web"""
    try:
        urllib.request.urlretrieve(url, download_path)
        return True
    except Exception as e:
        print(f"Error downloading file: {e}")
        return False

def process_file(file_path):
    """Process different file types and extract text"""
    file_extension = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_extension in ['.pdf']:
            return extract_text_from_pdf(file_path)
        elif file_extension in ['.png', '.jpg', '.jpeg']:
            return extract_text_from_image(file_path)
        else:
            return f"Unsupported file type: {file_extension}"
    except Exception as e:
        return f"Error processing file: {e}"

def handle_pdf_message(driver, message_element, pdf_tracker):
    """Enhanced handler for PDF messages with tracking"""
    if pdf_tracker.is_message_processed(message_element):
        print("This PDF message has already been processed, skipping...")
        return None
    
    try:
        pdf_selectors = [
            ".//div[contains(@class, 'x9f619 x78zum5 xdt5ytf x1qjc9v5 xh8yej3 x6ikm8r x10wlt62 x1heor9g x16tdsg8 xzp58vz xz6pen6')]",
            ".//div[@data-icon='document']",
            ".//span[@data-icon='document']",
            ".//div[contains(@class, 'document-message-download')]"
        ]
        
        for selector in pdf_selectors:
            try:
                pdf_elements = message_element.find_elements(By.XPATH, selector)
                if pdf_elements:
                    download_button = pdf_elements[0]
                    
                    try:
                        filename_element = message_element.find_element(By.XPATH, ".//span[contains(@class, 'message-file-name')]")
                        original_filename = filename_element.text
                    except:
                        original_filename = None
                    
                    driver.execute_script("arguments[0].click();", download_button)
                    time.sleep(3)
                    
                    downloads_dir = os.path.expanduser("~/Downloads")
                    latest_file = None
                    
                    for _ in range(30):
                        files = [f for f in os.listdir(downloads_dir) if f.endswith('.pdf')]
                        if files:
                            if original_filename:
                                matching_files = [f for f in files if original_filename.lower() in f.lower()]
                                if matching_files:
                                    latest_file = os.path.join(downloads_dir, matching_files[0])
                                    break
                            
                            latest_file = max([os.path.join(downloads_dir, f) for f in files], 
                                            key=os.path.getctime)
                            break
                        time.sleep(1)
                    
                    if latest_file:
                        project_pdf_path = pdf_tracker.save_pdf_to_project(latest_file, original_filename)
                        if project_pdf_path:
                            text = extract_text_from_pdf(project_pdf_path)
                            if text and len(text.strip()) > 0:
                                pdf_tracker.mark_message_processed(message_element)
                                pdf_tracker.store_pdf_content(original_filename or os.path.basename(project_pdf_path), text)
                                return text
                    break
            except Exception as e:
                print(f"Error with selector {selector}: {e}")
                continue
        
        return None
    except Exception as e:
        print(f"Error in handle_pdf_message: {e}")
        return None
    
# Modified fetch_latest_messages function
def fetch_latest_messages(pdf_tracker, driver):
    print("\nFetching the latest messages...")
    messages = driver.find_elements(By.XPATH, "//div[@role='row']")
    messages_data = []

    for message in messages[-5:]:
        try:
            sender = message.find_element(By.XPATH, ".//div[@class='_amk6 _amlo']/span").get_attribute("aria-label")
            
            file_content = handle_pdf_message(driver, message, pdf_tracker)
            
            if file_content:
                messages_data.append(('file', sender, file_content))
            else:
                try:
                    message_text = message.find_element(By.XPATH, ".//div[@class='_akbu']").text
                    messages_data.append(('text', sender, message_text))
                except:
                    pass
                    
        except Exception as e:
            print(f"Error processing message: {e}")
    
    return messages_data


def get_ai_response_for_file(file_content, query):
    try:
        # First, determine if visualization is needed
        analysis_prompt = f"""
        File content: {file_content}
        Query: {query}
        
        Analyze if this query requires visualization and what type. 
        Return JSON with format:
        {{
            "needs_visualization": boolean,
            "viz_type": "trend|heatmap|multi_line|statistical",
            "data_structure": {{
                "columns": [],
                "numeric_columns": [],
                "date_column": ""
            }}
        }}
        """

        viz_analysis = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a data analysis expert."},
                {"role": "user", "content": analysis_prompt}
            ]
        )
        
        analysis_result = json.loads(viz_analysis.choices[0].message.content)
        
        # Get the main answer
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are analyzing data and providing insights."},
                {"role": "user", "content": f"File content: {file_content}\n\nQuery: {query}"}
            ]
        )
        answer = response.choices[0].message.content

        if analysis_result.get('needs_visualization'):
            analytics = AnalyticsHelper()
            try:
                # Convert file content to DataFrame
                df = pd.read_csv(BytesIO(file_content.encode()))
                viz_path = None
                
                if analysis_result['viz_type'] == 'trend':
                    date_col = analysis_result['data_structure']['date_column']
                    numeric_col = analysis_result['data_structure']['numeric_columns'][0]
                    viz_path = analytics.create_interactive_trend_plot(
                        df, date_col, numeric_col, 
                        f"Trend Analysis: {numeric_col} over time"
                    )
                
                elif analysis_result['viz_type'] == 'heatmap':
                    viz_path = analytics.create_heatmap(df, "Correlation Analysis")
                
                elif analysis_result['viz_type'] == 'multi_line':
                    date_col = analysis_result['data_structure']['date_column']
                    numeric_cols = analysis_result['data_structure']['numeric_columns']
                    viz_path = analytics.create_multi_line_plot(
                        df, date_col, numeric_cols, 
                        "Multi-metric Analysis"
                    )
                
                elif analysis_result['viz_type'] == 'statistical':
                    viz_path = analytics.create_statistical_summary(
                        df, "Statistical Summary"
                    )

                return answer, viz_path
                
            except Exception as e:
                print(f"Error creating visualization: {e}")
                return answer, None
        
        return answer, None
        
    except Exception as e:
        print(f"Error in AI response generation: {e}")
        return None, None


# Modified continuously_fetch_messages function
def continuously_fetch_messages(last_message_time, fetched_messages, pdf_tracker, driver):
    while True:
        try:
            current_message_time = get_last_message_time()
            if current_message_time and current_message_time >= last_message_time:
                latest_messages = fetch_latest_messages(pdf_tracker, driver)
                new_messages = []
                
                for message_tuple in latest_messages:
                    if len(message_tuple) != 3:
                        continue
                    msg_type, sender, content = message_tuple
                    message_key = (msg_type, sender, content)
                    if sender and message_key not in fetched_messages:
                        new_messages.append(message_key)
                        fetched_messages.add(message_key)
                
                if new_messages:
                    for msg_type, sender, content in new_messages:
                        if sender == f"{target_chat}:":
                            if msg_type == 'text':
                                # Check if it's a query about PDF content
                                pdf_content = pdf_tracker.get_recent_pdf_content()
                                if pdf_content and content.lower().startswith(('what', 'how', 'why', 'can you', 'could you')):
                                    ai_response = get_ai_response_for_file(pdf_content, content)
                                else:
                                    ai_response = get_ai_response(content)
                            else:  # File message
                                ai_response = f"I've processed the file. You can ask me questions about its contents."
                            
                            if ai_response:
                                send_message_to_whatsapp(ai_response)
                                append_to_conversation_history(target_chat, content, ai_response)
                
                last_message_time = current_message_time
            
            time.sleep(5)
        
        except Exception as e:
            print(f"Error in message loop: {e}")
            continue
    
if __name__ == "__main__":
    options = Options()
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    pdf_tracker = PDFTracker()

    try:
        print("Navigating to WhatsApp Web...")
        driver.get("https://web.whatsapp.com")
        print("Please scan the QR code to log in to WhatsApp Web.")
        
        search_xpath = "//div[@contenteditable='true'][@data-tab='3']"
        alternative_search_xpath = "//div[@title='Search input textbox']"
        
        search_box = None
        for xpath in [search_xpath, alternative_search_xpath]:
            try:
                search_box = wait_for_element_presence(driver, xpath)
                if search_box:
                    break
            except:
                continue
                
        if not search_box:
            raise Exception("Could not find the search box")
            
        target_chat = "Donna"  # Replace with the desired chat name
        print(f"Searching for chat: {target_chat}")
        
        search_box.clear()
        search_box.send_keys(target_chat)
        time.sleep(2)
        
        chat_element = find_chat_element(driver, target_chat)
        
        if not chat_element:
            raise Exception(f"Could not find chat with name: {target_chat}")
            
        chat_element.click()
        time.sleep(3)
        
        last_message_time = get_last_message_time()
        fetched_messages = set()
        
        # Initialize with existing messages
        latest_messages = fetch_latest_messages(pdf_tracker, driver)
        for message_tuple in latest_messages:
            if len(message_tuple) == 3:
                fetched_messages.add(message_tuple)

        continuously_fetch_messages(last_message_time, fetched_messages, pdf_tracker, driver)
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        input("Press Enter to close the browser...")
        driver.quit()
