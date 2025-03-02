# import pandas as pd

# # Supplier data
# supplier_data = {
#     "Supplier_ID": ["SUP-001", "SUP-001"],
#     "Ambulances": [25, 20],
#     "Beds": [500, 450],
#     "Staff": [200, 180],
#     "Ventilators": [50, 40],
#     "Medical_Kits": [1000, 800],
#     "Last_Updated": ["2023-10-01 08:00:00", "2023-10-01 12:00:00"]
# }
# supplier_df = pd.DataFrame(supplier_data)

# # Hospital data
# hospital_data = {
#     "Hospital_ID": ["H-NOR-001", "H-SOU-001", "H-EAS-001", "H-WES-001"],
#     "Name": ["North General", "South Central", "East Care", "West Emergency"],
#     "Region": ["North", "South", "East", "West"],
#     "Beds_Available": [20, 150, 80, 50],
#     "Beds_Capacity": [200, 300, 150, 100],
#     "Staff_Available": [85, 120, 60, 40],
#     "Ambulances": [8, 12, 6, 4],
#     "Ventilators": [10, 25, 15, 8],
#     "Medical_Kits": [200, 400, 150, 100],
#     "Current_Patients": [180, 150, 70, 50],
#     "Capacity_Percent": ["90%", "50%", "47%", "50%"],
#     "Last_Updated": ["2023-10-01 08:00:00"] * 4
# }
# hospitals_df = pd.DataFrame(hospital_data)

# # Save to CSV
# supplier_df.to_csv("supplier.csv", index=False)
# hospitals_df.to_csv("hospitals.csv", index=False)

# import pandas as pd
# import numpy as np

# # Load your existing patient data
# patient_df = pd.read_csv("/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv")

# # Add a 'Region' column with random values (North/South/East/West)
# np.random.seed(42)  # For reproducibility
# regions = ["North", "South", "East", "West"]
# patient_df["Region"] = np.random.choice(regions, size=len(patient_df), p=[0.4, 0.2, 0.2, 0.2])  # Adjust probabilities if needed

# # Save the updated CSV
# patient_df.to_csv("patient_data_with_regions.csv", index=False)

# # Preview the data
# print(patient_df[["Patient ID", "Region"]].head())

# patient_df.to_csv("/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv", index=False)

import pandas as pd

def calculate_mews(row):
    score = 0
    
    # Heart Rate
    if row['Heart Rate'] < 40: score += 3
    elif 40 <= row['Heart Rate'] <= 50: score += 2
    elif 51 <= row['Heart Rate'] <= 100: score += 1
    else: score += 3
    
    # Systolic BP
    if row['Systolic BP'] < 70: score += 3
    elif 70 <= row['Systolic BP'] <= 80: score += 2
    elif 81 <= row['Systolic BP'] <= 100: score += 1
    else: score += 0
    
    # Respiratory Rate (example column: 'Respiratory Rate')
    if row['Respiratory Rate'] < 9: score += 3
    elif 9 <= row['Respiratory Rate'] <= 14: score += 0
    elif 15 <= row['Respiratory Rate'] <= 20: score += 1
    else: score += 3
    
    # Glasgow Coma Scale
    if row['Glasgow Coma Scale'] <= 8: score += 3
    elif 9 <= row['Glasgow Coma Scale'] <= 13: score += 1
    else: score += 0
    
    return score


df = pd.read_csv("/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv")
# Add MEWS and derived severity
# df['MEWS_Score'] = df.apply(calculate_mews, axis=1)
# df['Derived_Severity'] = pd.cut(
#     df['MEWS_Score'], 
#     bins=[-1, 2, 4, 100], 
#     labels=["Stable", "Urgent", "Critical"]
# )

# # Save the updated CSV
# df.to_csv("/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv", index=False)

# df.drop(columns=['MEWS_Score'], inplace=True)

# df.to_csv("/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv", index=False)

import pandas as pd

def calculate_mews(row):
    """Calculate MEWS score for a patient."""
    mews = 0
    
    # Heart Rate (bpm)
    hr = row['Heart Rate']
    if hr < 40 or hr > 120:
        mews += 3
    elif 40 <= hr <= 50 or 101 <= hr <= 120:
        mews += 2
    elif 51 <= hr <= 100:
        mews += 1
    
    # Systolic BP (mmHg)
    sbp = row['Systolic BP']
    if sbp < 70:
        mews += 3
    elif 70 <= sbp <= 80:
        mews += 2
    elif 81 <= sbp <= 100:
        mews += 1
    
    # Respiratory Rate
    rr = row['Respiratory Rate']
    if rr < 9 or rr > 20:
        mews += 3
    elif 9 <= rr <= 14:
        mews += 2
    elif 15 <= rr <= 20:
        mews += 1
    
    # Temperature (°C)
    temp = row['Body Temperature']
    if temp < 35.0:
        mews += 3
    elif 35.0 <= temp <= 36.0:
        mews += 2
    elif 36.1 <= temp <= 38.0:
        mews += 1
    elif temp > 38.0:
        mews += 3
    
    # Glasgow Coma Scale
    gcs = row['Glasgow Coma Scale']
    if gcs <= 8:
        mews += 3
    elif 9 <= gcs <= 12:
        mews += 2
    elif 13 <= gcs <= 14:
        mews += 1
    
    return mews

def mews_to_triage(mews_score):
    """Map MEWS score to triage level and time criticality."""
    if mews_score >= 5:
        return "Immediate", "Critical", 60
    elif 3 <= mews_score <= 4:
        return "Urgent", "Urgent", 120
    else:
        return "Delayed", "Stable", 240

# Load your patient data

# Calculate MEWS and triage
df["MEWS_Score"] = df.apply(calculate_mews, axis=1)
df[["Triage_MEWS", "Derived_Severity", "Time_Criticality_Min"]] = df["MEWS_Score"].apply(
    lambda x: pd.Series(mews_to_triage(x)))


# df.to_csv("/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv", index=False)


print(df.columns)