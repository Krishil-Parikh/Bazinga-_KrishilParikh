import pandas as pd
import numpy as np
import pickle
import tensorflow as tf
from tensorflow.keras.models import load_model
import os
import warnings
import openai
import json
import traceback
from datetime import datetime
warnings.filterwarnings('ignore')

class TriageAIAgent:
    def __init__(self, model_path="/Users/krishilparikh/Synergy/backend/Triage Flagging/triage_priority_model.h5", 
                encoders_path="/Users/krishilparikh/Synergy/backend/Triage Flagging/label_encoders.pkl", 
                scaler_path="/Users/krishilparikh/Synergy/backend/Triage Flagging/scaler.pkl",
                api_key=None):
        """Initialize the Triage AI Agent with necessary models and encoders"""
        self.model = load_model(model_path)
        with open(encoders_path, 'rb') as f:
            self.label_encoders = pickle.load(f)
        with open(scaler_path, 'rb') as f:
            self.scaler = pickle.load(f)
        
        # Set up OpenAI with enhanced debugging - using old API syntax
        try:
            # Use provided API key or get from environment
            self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
            
            if self.api_key:
                print(f"API key provided: {self.api_key[:8]}...{self.api_key[-5:]}")
                
                # Set the API key for the openai module (old style)
                openai.api_key = self.api_key
                
                # Test API key validity by making a minimal API call
                try:
                    print("Testing API key with a minimal request...")
                    test_response = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "user", "content": "Test connection (reply with 'OK')"}
                        ],
                        max_tokens=5
                    )
                    print(f"API test successful: {test_response.choices[0].message.content}")
                    print("OpenAI client initialized successfully")
                    self.openai_available = True
                except Exception as api_test_error:
                    print(f"API key test failed: {str(api_test_error)}")
                    print(f"Detailed error: {traceback.format_exc()}")
                    self.openai_available = False
            else:
                print("Warning: No OpenAI API key provided. LLM responses will not work.")
                self.openai_available = False
        except Exception as e:
            print(f"Error initializing OpenAI: {str(e)}")
            print(f"Detailed error: {traceback.format_exc()}")
            self.openai_available = False
            
        # Define required fields based on your CSV columns
        self.required_fields = [
            'Age', 'Gender', 'Heart Rate', 'Systolic BP', 'Diastolic BP', 
            'Oxygen Saturation', 'Respiratory Rate', 'Body Temperature',
            'Pupil Dilation', 'Pupil Reactivity', 'Eye Movement', 
            'Consciousness Level', 'Glasgow Coma Scale', 'Speech Coherence',
            'Blood Sugar Level', 'Skin Condition', 'Pain Level', 'Known Allergies',
            'Medication History', 'Symptoms', 'Initial Diagnosis', 'Arrival Mode'
        ]
        
        # Define categorical and numerical fields
        self.categorical_fields = [
            'Gender', 'Pupil Dilation', 'Pupil Reactivity', 'Eye Movement',
            'Consciousness Level', 'Speech Coherence', 'Skin Condition',
            'Known Allergies', 'Medication History', 'Symptoms', 
            'Initial Diagnosis', 'Arrival Mode'
        ]
        
        self.numerical_fields = [
            'Age', 'Heart Rate', 'Systolic BP', 'Diastolic BP', 
            'Oxygen Saturation', 'Respiratory Rate', 'Body Temperature',
            'Glasgow Coma Scale', 'Blood Sugar Level', 'Pain Level'
        ]
        
        # Define valid values for categorical fields based on your dataset
        self.valid_values = {
            'Gender': ['Male', 'Female'],
            'Pupil Dilation': ['Unequal', 'Constricted', 'Dilated', 'Normal'],
            'Pupil Reactivity': ['Reactive', 'Non-Reactive', 'Sluggish'],
            'Eye Movement': ['Normal', 'Uncoordinated', 'Fixed', 'Nystagmus'],
            'Consciousness Level': ['Confused', 'Alert', 'Unconscious'],
            'Speech Coherence': ['Incomprehensible', 'Coherent', 'Slurred', 'Mute'],
            'Skin Condition': ['Pale', 'Cyanotic', 'Normal'],
            'Known Allergies': ['Shellfish', 'Latex', 'Peanuts', 'None', 'Multiple Allergies', 'Pollen', 'Penicillin'],
            'Medication History': ['Antibiotics', 'Steroids', 'Anti-Seizure', 'Insulin', 'Blood Thinners', 'None', 'Painkillers'],
            'Symptoms': ['Altered Mental Status', 'No significant symptoms', 'Blurred Vision, Altered Mental Status', 
                        'Blurred Vision', 'Shortness of Breath, Blurred Vision', 'Shortness of Breath', 
                        'Shortness of Breath, Altered Mental Status', 'Shortness of Breath, Blurred Vision, Altered Mental Status'],
            'Initial Diagnosis': ['General Observation', 'Head Trauma / Stroke', 'Possible Respiratory Distress'],
            'Arrival Mode': ['Walk-in', 'Ambulance', 'Referred']
        }
        
        # Define triage priority mapping
        self.priority_mapping = {}
        if 'Triage Priority' in self.label_encoders:
            for i, priority in enumerate(self.label_encoders['Triage Priority'].classes_):
                self.priority_mapping[i] = priority
        else:
            # Fallback mapping if not in encoders
            self.priority_mapping = {
                0: "Immediate",
                1: "Delayed", 
                2: "Urgent"
            }
    
    def validate_input(self, user_input):
        """Validate user input for required fields and valid values"""
        missing_fields = []
        invalid_values = {}
        
        # Check for missing fields
        for field in self.required_fields:
            if field not in user_input or user_input[field] == "":
                missing_fields.append(field)
        
        # Check for valid values in categorical fields
        for field in self.categorical_fields:
            if field in user_input and user_input[field]:
                if field in self.valid_values and user_input[field] not in self.valid_values[field]:
                    invalid_values[field] = user_input[field]
        
        # Check for numerical fields
        for field in self.numerical_fields:
            if field in user_input and user_input[field]:
                try:
                    float(user_input[field])
                except ValueError:
                    invalid_values[field] = user_input[field]
        
        return missing_fields, invalid_values
    
    def preprocess_input(self, user_input):
        """Preprocess user input to match the model's expected format"""
        # Create a dataframe with user input
        df = pd.DataFrame([user_input])
        
        # Handle missing values
        df['Known Allergies'].fillna("None", inplace=True)
        df['Medication History'].fillna("None", inplace=True)
        
        # Convert numerical values
        for field in self.numerical_fields:
            if field in df.columns:
                df[field] = pd.to_numeric(df[field], errors='coerce')
        
        # Encode categorical variables using saved encoders
        for col in self.categorical_fields:
            if col in df.columns and col in self.label_encoders:
                try:
                    df[col] = self.label_encoders[col].transform(df[col])
                except:
                    # Handle unseen categories by using the most common category
                    print(f"Warning: Could not transform {col}. Using default value.")
                    df[col] = 0  # Default to first category
        
        # Apply scaling to numerical features
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if not numeric_cols.empty:
            try:
                df[numeric_cols] = self.scaler.transform(df[numeric_cols])
            except:
                print("Warning: Scaling error. Some numeric features might be out of range.")
                # Proceed anyway - the model should be robust to some scaling issues
            
        # Add 'Time of Arrival' with current time for completeness
        if 'Time of Arrival' not in df.columns:
            df['Time of Arrival'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return df
    
    def predict_triage(self, preprocessed_data):
        """Predict triage priority using the loaded ML model"""
        # Drop any columns that might not be needed for prediction
        if 'Triage Priority' in preprocessed_data.columns:
            preprocessed_data = preprocessed_data.drop(columns=['Triage Priority'])
        if 'Time of Arrival' in preprocessed_data.columns:
            preprocessed_data = preprocessed_data.drop(columns=['Time of Arrival'])
            
        # Get feature names from the model input
        model_features = self.model.input_shape[1]
        
        # Check if we need to drop additional columns
        # This handles the case where feature selection was done during training
        if len(preprocessed_data.columns) > model_features:
            print(f"Warning: Input has {len(preprocessed_data.columns)} features but model expects {model_features}.")
            # Keep only the first model_features columns
            # This is a simplistic approach - ideally, you'd know exactly which features were used
            preprocessed_data = preprocessed_data.iloc[:, :model_features]
        elif len(preprocessed_data.columns) < model_features:
            print(f"Warning: Input has {len(preprocessed_data.columns)} features but model expects {model_features}.")
            # Add dummy columns filled with zeros
            for i in range(model_features - len(preprocessed_data.columns)):
                preprocessed_data[f'dummy_{i}'] = 0
            
        # Make prediction
        prediction = self.model.predict(preprocessed_data)
        predicted_class = np.argmax(prediction, axis=1)[0]
        confidence = np.max(prediction) * 100
        
        # Map to priority name using the correct mapping
        priority = self.priority_mapping.get(predicted_class, "Unknown")
        
        return {
            'priority': priority,
            'confidence': confidence,
            'probabilities': {
                'Immediate': float(prediction[0][0]) * 100,
                'Urgent': float(prediction[0][1]) * 100,
                'Delayed': float(prediction[0][2]) * 100
            }
        }
    
    def generate_openai_response(self, user_input, prediction):
        """Generate a response using OpenAI's GPT-3.5 Turbo model with enhanced debugging"""
        print("\n--- STARTING OPENAI RESPONSE GENERATION ---")
        try:
            # Check if OpenAI is available
            if not self.openai_available:
                print("OpenAI not available. Using fallback response.")
                return self.generate_fallback_response(user_input, prediction)
                    
            # Create a prompt for the OpenAI model
            system_message = """You are a medical triage assistant. Based on the patient data and predicted triage priority, 
            provide a detailed triage assessment. Be professional, concise, and medically accurate. 
            Include recommended actions appropriate for the triage level."""
            
            # Format user input and prediction into a coherent prompt
            patient_data = {
                "Patient Information": {
                    "Age": user_input.get('Age', 'Unknown'),
                    "Gender": user_input.get('Gender', 'Unknown'),
                    "Arrival Mode": user_input.get('Arrival Mode', 'Unknown'),
                    },
                    "Vital Signs": {
                        "Heart Rate": user_input.get('Heart Rate', 'Unknown'),
                        "Blood Pressure": f"{user_input.get('Systolic BP', 'Unknown')}/{user_input.get('Diastolic BP', 'Unknown')}",
                        "Respiratory Rate": user_input.get('Respiratory Rate', 'Unknown'),
                        "Oxygen Saturation": user_input.get('Oxygen Saturation', 'Unknown'),
                        "Body Temperature": user_input.get('Body Temperature', 'Unknown'),
                    },
                    "Neurological Status": {
                        "Consciousness Level": user_input.get('Consciousness Level', 'Unknown'),
                        "Glasgow Coma Scale": user_input.get('Glasgow Coma Scale', 'Unknown'),
                        "Pupil Dilation": user_input.get('Pupil Dilation', 'Unknown'),
                        "Pupil Reactivity": user_input.get('Pupil Reactivity', 'Unknown'),
                        "Eye Movement": user_input.get('Eye Movement', 'Unknown'),
                        "Speech Coherence": user_input.get('Speech Coherence', 'Unknown'),
                    },
                    "Other Assessments": {
                        "Blood Sugar Level": user_input.get('Blood Sugar Level', 'Unknown'),
                        "Skin Condition": user_input.get('Skin Condition', 'Unknown'),
                        "Pain Level": user_input.get('Pain Level', 'Unknown'),
                    },
                    "Medical History": {
                        "Known Allergies": user_input.get('Known Allergies', 'None reported'),
                        "Medication History": user_input.get('Medication History', 'None reported'),
                    },
                    "Current Condition": {
                        "Symptoms": user_input.get('Symptoms', 'Unknown'),
                        "Initial Diagnosis": user_input.get('Initial Diagnosis', 'Unknown'),
                    },
                    "AI Triage Assessment": {
                        "Predicted Priority": prediction['priority'],
                        "Confidence": f"{prediction['confidence']:.1f}%",
                        "Time of Assessment": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    }
                }
            
            user_message = f"""
    Please provide a triage assessment and recommended actions for this patient.

    PATIENT DATA:
    {json.dumps(patient_data, indent=2)}

    The patient has been assigned a triage priority of {prediction['priority']} with {prediction['confidence']:.1f}% confidence.

    Format your response as a clinical triage assessment with clear sections for:
    1. TRIAGE ASSESSMENT
    2. PATIENT INFORMATION 
    3. KEY FINDINGS
    4. RECOMMENDED ACTIONS
    5. CAUTIONS/NOTES

    Include specific recommendations based on the triage priority level ({prediction['priority']}).
    """

            print(f"\nSystem message length: {len(system_message)} characters")
            print(f"User message length: {len(user_message)} characters")
            print(f"Total message length: {len(system_message) + len(user_message)} characters")
            
            print("\nAttempting to call OpenAI API...")
            # Call the OpenAI API with GPT-3.5 Turbo using old-style API
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": user_message}
                    ],
                    temperature=0.3,
                    max_tokens=800
                )
                
                print("OpenAI API call successful!")
                if hasattr(response, 'usage'):
                    print(f"Response tokens: {response.usage.completion_tokens}, Total tokens: {response.usage.total_tokens}")
                
                # Extract the generated text
                return response.choices[0].message.content.strip()
            except Exception as api_error:
                print(f"OpenAI API call failed: {str(api_error)}")
                print(f"Detailed API error: {traceback.format_exc()}")
                return self.generate_fallback_response(user_input, prediction)
            
        except Exception as e:
            print(f"Error in generate_openai_response: {str(e)}")
            print(f"Detailed error: {traceback.format_exc()}")
            # Fall back to template-based response
            return self.generate_fallback_response(user_input, prediction)
        finally:
            print("--- FINISHED OPENAI RESPONSE GENERATION ---\n")
    
    def generate_fallback_response(self, user_input, prediction):
        """Generate a fallback response when OpenAI is unavailable"""
        # Extract key information
        age = user_input.get('Age', 'Unknown')
        gender = user_input.get('Gender', 'Unknown')
        symptoms = user_input.get('Symptoms', 'Unknown')
        diagnosis = user_input.get('Initial Diagnosis', 'Unknown')
        priority = prediction['priority']
        confidence = prediction['confidence']
        
        # Create response based on triage priority
        if priority == "Immediate":
            response = f"""
TRIAGE ASSESSMENT: IMMEDIATE ATTENTION REQUIRED (Confidence: {confidence:.1f}%)

Patient: {age} year old {gender}
Symptoms: {symptoms}
Initial Diagnosis: {diagnosis}

This patient requires immediate medical attention. Critical vitals detected:
- Heart Rate: {user_input.get('Heart Rate', 'Abnormal')}
- Blood Pressure: {user_input.get('Systolic BP', 'Abnormal')}/{user_input.get('Diastolic BP', 'Abnormal')}
- Oxygen Saturation: {user_input.get('Oxygen Saturation', 'Abnormal')}
- Consciousness Level: {user_input.get('Consciousness Level', 'Abnormal')}

RECOMMENDED ACTIONS:
1. Immediate transfer to emergency treatment area
2. Notify attending physician and trauma team
3. Prepare for possible intubation and resuscitation protocols
4. Establish IV access and draw labs immediately
5. Continuous vital sign monitoring

CAUTION: Patient condition may deteriorate rapidly. Immediate intervention is critical.
"""
        elif priority == "Urgent":
            response = f"""
TRIAGE ASSESSMENT: URGENT CARE NEEDED (Confidence: {confidence:.1f}%)

Patient: {age} year old {gender}
Symptoms: {symptoms}
Initial Diagnosis: {diagnosis}

This patient requires urgent medical attention within 10-15 minutes. Concerning findings:
- Vital Signs: BP {user_input.get('Systolic BP', 'Concerning')}/{user_input.get('Diastolic BP', 'Concerning')}, HR {user_input.get('Heart Rate', 'Concerning')}
- Respiratory Status: {user_input.get('Respiratory Rate', 'Concerning')} breaths/min, O2 Sat {user_input.get('Oxygen Saturation', 'Concerning')}%
- Neurological: GCS {user_input.get('Glasgow Coma Scale', 'Concerning')}, {user_input.get('Consciousness Level', 'Concerning')}

RECOMMENDED ACTIONS:
1. Place in monitored bed in urgent care area
2. Obtain complete vital signs q15min
3. Establish IV access if not already present
4. Administer pain management as appropriate (Pain Level: {user_input.get('Pain Level', 'Unknown')})
5. Notify physician for evaluation within 15 minutes

Allergies: {user_input.get('Known Allergies', 'None reported')}
Current Medications: {user_input.get('Medication History', 'None reported')}

CAUTION: Monitor for changes in mental status or vital signs.
"""
        else:  # Delayed
            response = f"""
TRIAGE ASSESSMENT: DELAYED PRIORITY (Confidence: {confidence:.1f}%)

Patient: {age} year old {gender}
Symptoms: {symptoms}
Initial Diagnosis: {diagnosis}

This patient can safely wait for medical attention. Stable findings:
- Vital Signs: Within acceptable parameters
- Blood Pressure: {user_input.get('Systolic BP', 'Stable')}/{user_input.get('Diastolic BP', 'Stable')} mmHg
- Heart Rate: {user_input.get('Heart Rate', 'Stable')} bpm
- Oxygen Saturation: {user_input.get('Oxygen Saturation', 'Stable')}%
- Pain Level: {user_input.get('Pain Level', 'Stable')}/10

RECOMMENDED ACTIONS:
1. Place in waiting area with periodic reassessment every 30-60 minutes
2. Provide comfort measures as needed
3. Encourage oral hydration if appropriate
4. Reassess if condition changes or after 2 hours of waiting

Allergies: {user_input.get('Known Allergies', 'None reported')}
Current Medications: {user_input.get('Medication History', 'None reported')}

Note: Patient should be instructed to notify staff immediately if symptoms worsen.
"""
        
        return response
    
    def process(self, user_input):
        """Process user input through the entire pipeline with enhanced debugging"""
        print("\n=== STARTING TRIAGE PROCESS ===")
        # Step 1: Validate input
        print("Validating input...")
        missing_fields, invalid_values = self.validate_input(user_input)
        
        if missing_fields or invalid_values:
            response = "Please correct the following issues:\n"
            if missing_fields:
                response += f"\nMissing required fields: {', '.join(missing_fields)}\n"
            if invalid_values:
                response += "\nInvalid values:\n"
                for field, value in invalid_values.items():
                    response += f"- {field}: '{value}' is not valid. "
                    if field in self.valid_values:
                        response += f"Valid options are: {', '.join(self.valid_values[field])}\n"
                    else:
                        response += "Should be a number.\n"
            print("Input validation failed.")
            return {"status": "error", "message": response}
        
        print("Input validation successful.")
        
        try:
            # Step 2: Preprocess input
            print("Preprocessing input...")
            preprocessed_data = self.preprocess_input(user_input)
            print("Input preprocessing complete.")
            
            # Step 3: Predict triage priority
            print("Predicting triage priority...")
            prediction = self.predict_triage(preprocessed_data)
            print(f"Triage prediction: {prediction['priority']} with {prediction['confidence']:.1f}% confidence.")
            
            # Step 4: Generate response using OpenAI
            print("Generating response...")
            llm_response = self.generate_openai_response(user_input, prediction)
            print("Response generation complete.")
            
            print("=== TRIAGE PROCESS COMPLETED SUCCESSFULLY ===\n")
            return {
                "status": "success",
                "triage_prediction": prediction,
                "response": llm_response
            }
        except Exception as e:
            print(f"Error in process method: {str(e)}")
            print(f"Detailed error: {traceback.format_exc()}")
            print("=== TRIAGE PROCESS FAILED ===\n")
            return {"status": "error", "message": f"An error occurred: {str(e)}"}


# Additional testing code for the main block
if __name__ == "__main__":
    # Check if model files exist
    model_exists = os.path.exists("triage_priority_model.h5")
    encoders_exist = os.path.exists("label_encoders.pkl")
    scaler_exists = os.path.exists("scaler.pkl")
    
    if not (model_exists and encoders_exist and scaler_exists):
        print("Warning: Model files not found. This is just a demonstration of the agent structure.")
    
    # Validate OpenAI API key directly
    api_key = "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"
    
    print(f"\n\n==== TESTING OPENAI API KEY ====")
    print(f"API Key provided: {api_key[:8]}...{api_key[-5:]}")
    
    try:
        print("Testing OpenAI connection directly...")
        openai.api_key = api_key
        test_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": "Reply with OK if you can see this."}
            ],
            max_tokens=10
        )
        print(f"Direct OpenAI test successful. Response: {test_response.choices[0].message.content}")
    except Exception as e:
        print(f"Direct OpenAI test failed: {str(e)}")
        print(f"Detailed error: {traceback.format_exc()}")
    
    print("==== OPENAI API KEY TESTING COMPLETE ====\n\n")
    
    # Initialize agent
    try:
        print("Initializing TriageAIAgent...")
        agent = TriageAIAgent(api_key=api_key)
        
        # Sample input data
        sample_input = {
            'Age': '45',
            'Gender': 'Male',
            'Heart Rate': '110',
            'Systolic BP': '160',
            'Diastolic BP': '95',
            'Oxygen Saturation': '92',
            'Respiratory Rate': '22',
            'Body Temperature': '38.5',
            'Pupil Dilation': 'Normal',
            'Pupil Reactivity': 'Reactive',
            'Eye Movement': 'Normal',
            'Consciousness Level': 'Alert',
            'Glasgow Coma Scale': '15',
            'Speech Coherence': 'Coherent',
            'Blood Sugar Level': '110',
            'Skin Condition': 'Normal',
            'Pain Level': '7',
            'Known Allergies': 'Penicillin',
            'Medication History': 'Painkillers',
            'Symptoms': 'Shortness of Breath',
            'Initial Diagnosis': 'Possible Respiratory Distress',
            'Arrival Mode': 'Walk-in'
        }
        
        # Process the input
        print("\n\n==== PROCESSING SAMPLE INPUT ====")
        result = agent.process(sample_input)
        
        # Print the result
        if result["status"] == "success":
            print(f"Predicted Triage Priority: {result['triage_prediction']['priority']}")
            print(f"Confidence: {result['triage_prediction']['confidence']:.2f}%")
            print("\nDetailed Response:")
            print(result["response"])
        else:
            print(f"Error: {result['message']}")
        
        print("==== SAMPLE INPUT PROCESSING COMPLETE ====\n\n")
            
    except Exception as e:
        print(f"Could not initialize agent: {str(e)}")
        print(f"Detailed error: {traceback.format_exc()}")
        print("This is a demonstration of the agent structure only.")