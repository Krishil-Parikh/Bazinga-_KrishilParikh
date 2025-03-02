import pandas as pd

# Sample DataFrames
df1 = pd.read_csv("/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv")
df2 = pd.read_csv("/Users/krishilparikh/Synergy/backend/allocation_results.csv")

# Merge on the 'ID' column
merged_df = pd.merge(df1, df2, on='Patient_ID', how='inner')

print(merged_df)

# merged_df.to_csv("/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv", index=False)

merged_df.to_json("patients_allocation.json", orient='records', lines=True)