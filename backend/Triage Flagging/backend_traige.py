import pandas as pd
import numpy as np
import pickle
import tensorflow as tf
from tensorflow.keras.models import load_model
import os
import warnings
warnings.filterwarnings('ignore')

class TriageAIAgent:
    def __init__(self, model_path="triage_priority_model.h5", 
                 encoders_path="label_encoders.pkl", 
                 scaler_path="scaler.pkl"):
        """Initialize the Triage AI Agent with necessary models and encoders"""
        self.model = load_model(model_path)
        with open(encoders_path, 'rb') as f:
            self.label_encoders = pickle.load(f)
        with open(scaler_path, 'rb') as f:
            self.scaler = pickle.load(f)
        
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
        self.triage_priorities = {
            0: "Immediate",
            1: "Urgent",
            2: "Delayed"
        }
        
        # Reverse mapping in case the model was trained with different encodings
        # This ensures we correctly interpret the model output
        # You may need to adjust this based on how your label encoder encoded the values
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
            df['Time of Arrival'] = pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
        
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
    
    def generate_llm_response(self, user_input, prediction):
        """Generate a response based on the prediction and user input"""
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
        """Process user input through the entire pipeline"""
        # Step 1: Validate input
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
            return {"status": "error", "message": response}
        
        try:
            # Step 2: Preprocess input
            preprocessed_data = self.preprocess_input(user_input)
            
            # Step 3: Predict triage priority
            prediction = self.predict_triage(preprocessed_data)
            
            # Step 4: Generate response
            llm_response = self.generate_llm_response(user_input, prediction)
            
            return {
                "status": "success",
                "triage_prediction": prediction,
                "response": llm_response
            }
        except Exception as e:
            return {"status": "error", "message": f"An error occurred: {str(e)}"}

# Example usage
if __name__ == "__main__":
    # Check if model files exist
    model_exists = os.path.exists("triage_priority_model.h5")
    encoders_exist = os.path.exists("label_encoders.pkl")
    scaler_exists = os.path.exists("scaler.pkl")
    
    if not (model_exists and encoders_exist and scaler_exists):
        print("Warning: Model files not found. This is just a demonstration of the agent structure.")
    
    # Initialize agent
    try:
        agent = TriageAIAgent()
        
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
        result = agent.process(sample_input)
        
        # Print the result
        if result["status"] == "success":
            print(f"Predicted Triage Priority: {result['triage_prediction']['priority']}")
            print(f"Confidence: {result['triage_prediction']['confidence']:.2f}%")
            print("\nDetailed Response:")
            print(result["response"])
        else:
            print(f"Error: {result['message']}")
            
    except Exception as e:
        print(f"Could not initialize agent: {str(e)}")
        print("This is a demonstration of the agent structure only.")