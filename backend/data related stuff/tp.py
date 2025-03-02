import csv
import json

# Read CSV
with open("/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv", mode="r", encoding="utf-8") as csv_file:
    csv_reader = csv.DictReader(csv_file)
    
    # Convert to JSON
    json_data = list(csv_reader)

# Save JSON
with open("patients_allocation.json", mode="w", encoding="utf-8") as json_file:
    json.dump(json_data, json_file, indent=4)

print("CSV converted to JSON successfully!")
