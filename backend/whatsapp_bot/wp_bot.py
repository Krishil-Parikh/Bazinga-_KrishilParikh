import pandas as pd
import numpy as np
import pulp as pl
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
import json
import os

class HealthcareResourceAllocator:
    def __init__(self, patients_file, hospitals_file, suppliers_file):
        """Initialize the resource allocator with data files."""
        self.patients_file = patients_file
        self.hospitals_file = hospitals_file
        self.suppliers_file = suppliers_file
        
        self.patients_df = pd.read_csv(patients_file)
        self.hospitals_df = pd.read_csv(hospitals_file)
        self.suppliers_df = pd.read_csv(suppliers_file)
        self.allocation_results = None
        
        # Preprocess data
        self._preprocess_data()
        
    def _preprocess_data(self):
        """Preprocess and clean the data."""
        # Convert timestamps to datetime
        if 'Time of Arrival' in self.patients_df.columns:
            self.patients_df['Time of Arrival'] = pd.to_datetime(self.patients_df['Time of Arrival'])
        
        if 'Last_Updated' in self.hospitals_df.columns:
            self.hospitals_df['Last_Updated'] = pd.to_datetime(self.hospitals_df['Last_Updated'])
            
        if 'Last_Updated' in self.suppliers_df.columns:
            self.suppliers_df['Last_Updated'] = pd.to_datetime(self.suppliers_df['Last_Updated'])
        
        # Calculate available resources per hospital
        self.hospitals_df['Effective_Beds'] = self.hospitals_df['Beds_Available']
        self.hospitals_df['Effective_Staff'] = self.hospitals_df['Staff_Available']
        
        # Create patient priority score based on available metrics
        # First check column data types and convert if necessary
        if 'Triage Priority' in self.patients_df.columns:
            # Handle case where Triage Priority is a string
            try:
                self.patients_df['Triage Priority'] = pd.to_numeric(self.patients_df['Triage Priority'])
            except (ValueError, TypeError):
                # If conversion fails, create a mapping for string values
                priority_mapping = {'Immediate': 1, 'Emergency': 1, 'Urgent': 2, 'Semi-urgent': 3, 'Non-urgent': 4, 'Minor': 5}
                # Apply with a default value of 3 (middle priority) for any unexpected values
                self.patients_df['Triage_Priority_Numeric'] = self.patients_df['Triage Priority'].map(priority_mapping).fillna(3)
        
        # Same for MEWS Score
        if 'MEWS_Score' in self.patients_df.columns:
            try:
                self.patients_df['MEWS_Score'] = pd.to_numeric(self.patients_df['MEWS_Score'])
            except (ValueError, TypeError):
                # Set default value if conversion fails
                self.patients_df['MEWS_Score'] = 2  # Default moderate score
        
        # Same for Time Criticality
        if 'Time_Criticality_Min' in self.patients_df.columns:
            try:
                self.patients_df['Time_Criticality_Min'] = pd.to_numeric(self.patients_df['Time_Criticality_Min'])
            except (ValueError, TypeError):
                # Set default value if conversion fails
                self.patients_df['Time_Criticality_Min'] = 60  # Default 1 hour
        
        # Now calculate the priority score based on available and properly typed data
        if all(col in self.patients_df.columns for col in ['Triage Priority', 'MEWS_Score', 'Time_Criticality_Min']):
            if 'Triage_Priority_Numeric' in self.patients_df.columns:
                # Use the mapped numeric value
                self.patients_df['Priority_Score'] = (5 - self.patients_df['Triage_Priority_Numeric']) * 5 + \
                                                   self.patients_df['MEWS_Score'] * 2 + \
                                                   (60 / (self.patients_df['Time_Criticality_Min'] + 1))
            else:
                # Use the numeric Triage Priority directly
                self.patients_df['Priority_Score'] = (5 - self.patients_df['Triage Priority']) * 5 + \
                                                   self.patients_df['MEWS_Score'] * 2 + \
                                                   (60 / (self.patients_df['Time_Criticality_Min'] + 1))
        elif 'Derived_Severity' in self.patients_df.columns:
            # Try to use derived severity if other metrics not available
            try:
                self.patients_df['Derived_Severity'] = pd.to_numeric(self.patients_df['Derived_Severity'])
                self.patients_df['Priority_Score'] = self.patients_df['Derived_Severity'] * 10
            except (ValueError, TypeError):
                # If conversion fails, use a simple default score
                self.patients_df['Priority_Score'] = 50  # Middle priority
        else:
            # If no suitable metrics available, assign default values
            self.patients_df['Priority_Score'] = 50  # Middle priority
            self.patients_df['MEWS_Score'] = self.patients_df.get('MEWS_Score', 2)  # Default moderate score
    
    def optimize_allocation(self):
        """Run the optimization model to allocate patients to hospitals."""
        # Create optimization problem
        model = pl.LpProblem("Healthcare_Resource_Allocation", pl.LpMaximize)
        
        # Get relevant data
        patients = self.patients_df
        hospitals = self.hospitals_df
        
        # Ensure 'Region' column exists in patients DataFrame
        if 'Region' not in patients.columns:
            # Default all patients to first region if missing
            default_region = hospitals['Region'].iloc[0] if not hospitals.empty else "Unknown"
            patients['Region'] = default_region
        
        # Create decision variables
        # x[i,j] = 1 if patient i is assigned to hospital j, 0 otherwise
        x = pl.LpVariable.dicts("patient_assignment", 
                              [(i, j) for i in patients.index for j in hospitals.index],
                              cat=pl.LpBinary)
        
        # Objective function: Maximize weighted sum of patient-hospital assignments
        # Weight includes patient priority and regional matching
        objective = pl.lpSum([x[i,j] * patients.loc[i, 'Priority_Score'] * 
                            (2 if patients.loc[i, 'Region'] == hospitals.loc[j, 'Region'] else 1)
                            for i in patients.index for j in hospitals.index])
        model += objective
        
        # Constraint 1: Each patient is assigned to at most one hospital
        for i in patients.index:
            model += pl.lpSum([x[i,j] for j in hospitals.index]) <= 1
        
        # Constraint 2: Hospital bed capacity
        for j in hospitals.index:
            model += pl.lpSum([x[i,j] for i in patients.index]) <= hospitals.loc[j, 'Effective_Beds']
        
        # Constraint 3: Hospital staff capacity
        # Assume each patient needs 0.5 staff members on average
        if 'Effective_Staff' in hospitals.columns:
            for j in hospitals.index:
                model += pl.lpSum([x[i,j] * 0.5 for i in patients.index]) <= hospitals.loc[j, 'Effective_Staff']
        
        # Constraint 4: Ensure hospitals have necessary equipment for critical patients
        # For critical patients (MEWS >= 5), ensure ventilator availability
        if 'MEWS_Score' in patients.columns and 'Ventilators' in hospitals.columns:
            critical_patients = [i for i in patients.index if patients.loc[i, 'MEWS_Score'] >= 5]
            for j in hospitals.index:
                model += pl.lpSum([x[i,j] for i in critical_patients]) <= hospitals.loc[j, 'Ventilators']
        
        # Solve the model
        model.solve()
        
        # Extract results
        allocation_results = []
        for i in patients.index:
            assigned_hospital = None
            for j in hospitals.index:
                if pl.value(x[i,j]) == 1:
                    assigned_hospital = j
                    break
            
            result_row = {
                'Patient_ID': patients.loc[i, 'Patient ID'] if 'Patient ID' in patients.columns else i,
                'Patient_Name': patients.loc[i, 'Patient Name'] if 'Patient Name' in patients.columns else f"Patient_{i}",
                'Priority_Score': patients.loc[i, 'Priority_Score'],
                'Patient_Region': patients.loc[i, 'Region']
            }
            
            # Add MEWS Score if available
            if 'MEWS_Score' in patients.columns:
                result_row['MEWS_Score'] = patients.loc[i, 'MEWS_Score']
            
            if assigned_hospital is not None:
                result_row.update({
                    'Assigned_Hospital': hospitals.loc[assigned_hospital, 'Name'] if 'Name' in hospitals.columns else f"Hospital_{assigned_hospital}",
                    'Hospital_Region': hospitals.loc[assigned_hospital, 'Region'],
                    'Is_Regional_Match': patients.loc[i, 'Region'] == hospitals.loc[assigned_hospital, 'Region']
                })
            else:
                result_row.update({
                    'Assigned_Hospital': 'Unassigned',
                    'Hospital_Region': None,
                    'Is_Regional_Match': False
                })
                
            allocation_results.append(result_row)
        
        self.allocation_results = pd.DataFrame(allocation_results)
        return self.allocation_results
    
    def allocate_supplier_resources(self):
        """Allocate supplier resources to hospitals based on need."""
        if self.allocation_results is None:
            raise ValueError("Must run optimize_allocation() first")
        
        # Check if supplier data exists
        if self.suppliers_df.empty:
            return pd.DataFrame()  # Return empty DataFrame if no suppliers
        
        # Create optimization problem
        model = pl.LpProblem("Supplier_Resource_Allocation", pl.LpMinimize)
        
        hospitals = self.hospitals_df
        suppliers = self.suppliers_df
        
        # Ensure 'Name' column exists in hospitals DataFrame
        if 'Name' not in hospitals.columns:
            hospitals['Name'] = [f"Hospital_{i}" for i in hospitals.index]
            
        # Ensure 'Region' column exists in suppliers DataFrame
        if 'Region' not in suppliers.columns:
            # Default all suppliers to first region if missing
            default_region = hospitals['Region'].iloc[0] if not hospitals.empty else "Unknown"
            suppliers['Region'] = default_region
        
        # Calculate hospital needs based on patient allocation
        hospital_patient_counts = self.allocation_results['Assigned_Hospital'].value_counts()
        hospitals['Additional_Patients'] = hospitals['Name'].map(hospital_patient_counts).fillna(0)
        
        # Estimate additional resources needed
        hospitals['Additional_Beds_Needed'] = hospitals['Additional_Patients']
        hospitals['Additional_Staff_Needed'] = hospitals['Additional_Patients'] * 0.5
        hospitals['Additional_Medical_Kits_Needed'] = hospitals['Additional_Patients']
        
        # Check what resources are available from suppliers
        available_resources = []
        if 'Beds' in suppliers.columns:
            available_resources.append('Beds')
        if 'Staff' in suppliers.columns:
            available_resources.append('Staff')
        if 'Medical_Kits' in suppliers.columns:
            available_resources.append('Medical_Kits')
            
        # If no resources available, return empty DataFrame
        if not available_resources:
            return pd.DataFrame()
        
        # Create decision variables
        # y[s,h,r] = amount of resource r from supplier s to hospital h
        y = {}
        for s in suppliers.index:
            for h in hospitals.index:
                for r in available_resources:
                    y[s,h,r] = pl.LpVariable(f"supply_{s}_{h}_{r}", lowBound=0, cat=pl.LpInteger)
        
        # Objective: Minimize transportation costs (approximated by distance)
        # Assume distances are related to whether supplier and hospital are in same region
        transportation_cost = pl.lpSum([y[s,h,r] * 
                                     (1 if suppliers.loc[s, 'Region'] == hospitals.loc[h, 'Region'] else 3)
                                     for s in suppliers.index 
                                     for h in hospitals.index 
                                     for r in available_resources])
        model += transportation_cost
        
        # Constraint 1: Supplier capacity
        for s in suppliers.index:
            for r in available_resources:
                model += pl.lpSum([y[s,h,r] for h in hospitals.index]) <= suppliers.loc[s, r]
        
        # Constraint 2: Hospital needs
        for h in hospitals.index:
            if 'Beds' in available_resources:
                model += pl.lpSum([y[s,h,'Beds'] for s in suppliers.index]) >= hospitals.loc[h, 'Additional_Beds_Needed']
            if 'Staff' in available_resources:
                model += pl.lpSum([y[s,h,'Staff'] for s in suppliers.index]) >= hospitals.loc[h, 'Additional_Staff_Needed']
            if 'Medical_Kits' in available_resources:
                model += pl.lpSum([y[s,h,'Medical_Kits'] for s in suppliers.index]) >= hospitals.loc[h, 'Additional_Medical_Kits_Needed']
        
        # Solve the model
        model.solve(pl.PULP_CBC_CMD(msg=False))
        
        # Extract results
        supply_results = []
        for s in suppliers.index:
            for h in hospitals.index:
                for r in available_resources:
                    if pl.value(y[s,h,r]) > 0:
                        supply_results.append({
                            'Supplier_ID': suppliers.loc[s, 'Supplier_ID'] if 'Supplier_ID' in suppliers.columns else f"Supplier_{s}",
                            'Hospital': hospitals.loc[h, 'Name'],
                            'Resource': r,
                            'Amount': pl.value(y[s,h,r]),
                            'Is_Regional_Match': suppliers.loc[s, 'Region'] == hospitals.loc[h, 'Region']
                        })
        
        self.supply_results = pd.DataFrame(supply_results)
        return self.supply_results
    
    def generate_reports(self):
        """Generate summary reports of the allocation results."""
        if self.allocation_results is None:
            raise ValueError("Must run optimize_allocation() first")
        
        # Patient allocation summary
        patient_summary = {
            'Total_Patients': len(self.allocation_results),
            'Assigned_Patients': sum(self.allocation_results['Assigned_Hospital'] != 'Unassigned'),
            'Unassigned_Patients': sum(self.allocation_results['Assigned_Hospital'] == 'Unassigned'),
            'Regional_Matches': sum(self.allocation_results['Is_Regional_Match']),
            'Average_Priority_Score': self.allocation_results['Priority_Score'].mean()
        }
        
        # Add MEWS stats if available
        if 'MEWS_Score' in self.allocation_results.columns:
            patient_summary['High_MEWS_Patients'] = sum(self.allocation_results['MEWS_Score'] >= 5)
        
        # Hospital utilization
        hospital_counts = self.allocation_results['Assigned_Hospital'].value_counts().to_dict()
        hospital_util = {}
        
        for h in self.hospitals_df.index:
            name = self.hospitals_df.loc[h, 'Name'] if 'Name' in self.hospitals_df.columns else f"Hospital_{h}"
            
            # Get capacity if available
            if 'Beds_Capacity' in self.hospitals_df.columns:
                capacity = self.hospitals_df.loc[h, 'Beds_Capacity']
            else:
                capacity = self.hospitals_df.loc[h, 'Beds_Available'] if 'Beds_Available' in self.hospitals_df.columns else 0
            
            # Get current patients if available
            if 'Current_Patients' in self.hospitals_df.columns:
                current = self.hospitals_df.loc[h, 'Current_Patients']
            else:
                current = 0
                
            assigned = hospital_counts.get(name, 0)
            util_pct = (current + assigned) / capacity * 100 if capacity > 0 else 0
            
            hospital_util[name] = {
                'Capacity': capacity,
                'Current_Patients': current,
                'Newly_Assigned': assigned,
                'Utilization_Percent': util_pct
            }
        
        return {
            'patient_summary': patient_summary,
            'hospital_utilization': hospital_util
        }
    
    def get_patient_status(self, mews_score=None, triage_priority=None):
        """Determine patient status based on MEWS score or triage priority."""
        if mews_score is not None:
            if mews_score >= 7:
                return "Critical"
            elif mews_score >= 5:
                return "Urgent"
            elif mews_score >= 3:
                return "Semi-Urgent"
            else:
                return "Stable"
        elif triage_priority is not None:
            # Lower numbers are higher priority
            if triage_priority in [1, 'Immediate', 'Emergency']:
                return "Critical"
            elif triage_priority in [2, 'Urgent']:
                return "Urgent"
            elif triage_priority in [3, 'Semi-urgent']:
                return "Semi-Urgent"
            else:
                return "Routine"
        else:
            return "Unknown"
    
    def create_patient_json(self):
        """Create JSON representation of patients with required fields."""
        if self.allocation_results is None:
            raise ValueError("Must run optimize_allocation() first")
        
        patients_json = []
        
        for idx, row in self.allocation_results.iterrows():
            patient_id = row['Patient_ID']
            
            # Find original patient data
            patient_idx = None
            if 'Patient ID' in self.patients_df.columns:
                matches = self.patients_df[self.patients_df['Patient ID'] == patient_id].index
                if len(matches) > 0:
                    patient_idx = matches[0]
            
            if patient_idx is None:
                # Try to match by index if Patient ID didn't work
                if isinstance(patient_id, int) and patient_id < len(self.patients_df):
                    patient_idx = patient_id
            
            if patient_idx is not None:
                orig_patient = self.patients_df.loc[patient_idx]
                
                # Get wait time
                wait_time = None
                if 'Time of Arrival' in orig_patient and pd.notna(orig_patient['Time of Arrival']):
                    arrive_time = pd.to_datetime(orig_patient['Time of Arrival'])
                    wait_time = (datetime.now() - arrive_time).total_seconds() / 60  # in minutes
                
                # Extract symptoms
                symptoms = orig_patient.get('Symptoms', orig_patient.get('Chief Complaint', 'Not recorded'))
                
                # Get triage priority or MEWS score for status
                triage_priority = None
                if 'Triage Priority' in orig_patient:
                    triage_priority = orig_patient['Triage Priority']
                elif 'Triage_Priority_Numeric' in orig_patient:
                    triage_priority = orig_patient['Triage_Priority_Numeric']
                
                mews_score = orig_patient.get('MEWS_Score', None)
                
                # Determine status
                status = self.get_patient_status(mews_score, triage_priority)
                
                # Get diagnosis if available
                diagnosis = orig_patient.get('Diagnosis', orig_patient.get('Preliminary Diagnosis', 'Pending'))
                
                # Create patient JSON entry
                patient_entry = {
                    "id": str(patient_id),
                    "name": row['Patient_Name'],
                    "symptoms": symptoms,
                    "waittime": int(wait_time) if wait_time is not None else "Unknown",
                    "admission_time": orig_patient.get('Time of Arrival', "Unknown"),
                    "diagnosis": diagnosis,
                    "status": status,
                    "assigned_hospital": row['Assigned_Hospital'],
                    "mews_score": float(mews_score) if mews_score is not None else None,
                    "triage_priority": triage_priority
                }
                
                patients_json.append(patient_entry)
        
        return patients_json
    
    def update_csv_files(self, patients_json):
        """Update the CSV files with allocation results."""
        # Update patients CSV with assignments
        for patient in patients_json:
            patient_id = patient['id']
            
            # Find the patient in the dataframe
            if 'Patient ID' in self.patients_df.columns:
                mask = self.patients_df['Patient ID'].astype(str) == str(patient_id)
                if mask.any():
                    # Update patient information
                    self.patients_df.loc[mask, 'Assigned_Hospital'] = patient['assigned_hospital']
                    self.patients_df.loc[mask, 'Status'] = patient['status']
                    
                    # Update diagnosis if it was 'Pending'
                    if 'Diagnosis' in self.patients_df.columns:
                        if pd.isna(self.patients_df.loc[mask, 'Diagnosis']).any() or self.patients_df.loc[mask, 'Diagnosis'].iloc[0] == 'Pending':
                            self.patients_df.loc[mask, 'Diagnosis'] = patient['diagnosis']
        
        # Update hospitals CSV with new patient counts
        if 'Name' in self.hospitals_df.columns:
            hospital_counts = self.allocation_results['Assigned_Hospital'].value_counts()
            
            for hospital_name, count in hospital_counts.items():
                if hospital_name != 'Unassigned':
                    mask = self.hospitals_df['Name'] == hospital_name
                    if mask.any():
                        # Update patient counts
                        if 'Current_Patients' in self.hospitals_df.columns:
                            self.hospitals_df.loc[mask, 'Current_Patients'] += count
                        else:
                            self.hospitals_df.loc[mask, 'Current_Patients'] = count
                        
                        # Update available beds
                        if 'Beds_Available' in self.hospitals_df.columns:
                            self.hospitals_df.loc[mask, 'Beds_Available'] -= count
                            # Ensure no negative values
                            self.hospitals_df.loc[self.hospitals_df['Beds_Available'] < 0, 'Beds_Available'] = 0
        
        # Save updated CSVs
        self.patients_df.to_csv(self.patients_file, index=False)
        self.hospitals_df.to_csv(self.hospitals_file, index=False)
        
        return True
    
    def save_json_output(self, output_file="patients_allocation.json"):
        """Save patient data to a JSON file."""
        patients_json = self.create_patient_json()
        
        with open(output_file, 'w') as f:
            json.dump(patients_json, f, indent=2, default=str)
        
        return output_file
    
    def run_full_allocation(self, update_csv=True, save_json=True, json_file="patients_allocation.json"):
        """Run the complete allocation process and return results."""
        # Run optimization
        patient_allocation = self.optimize_allocation()
        
        try:
            supplier_allocation = self.allocate_supplier_resources()
        except Exception as e:
            print(f"Warning: Supplier allocation failed with error: {e}")
            supplier_allocation = pd.DataFrame()
            
        reports = self.generate_reports()
        
        # Create patient JSON
        patients_json = self.create_patient_json()
        
        # Update CSV files if requested
        if update_csv:
            self.update_csv_files(patients_json)
        
        # Save JSON output if requested
        if save_json:
            self.save_json_output(json_file)
            
        return {
            'patient_allocation': patient_allocation,
            'supplier_allocation': supplier_allocation,
            'reports': reports,
            'patients_json': patients_json
        }


# Example usage
def main():
    # Create the allocator (using actual file paths)
    patients_file = '/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv'  # Update with your actual path
    hospitals_file = '/Users/krishilparikh/Synergy/backend/hospitals.csv'
    suppliers_file = '/Users/krishilparikh/Synergy/backend/supplier.csv'
    
    allocator = HealthcareResourceAllocator(patients_file, hospitals_file, suppliers_file)
    
    # Run the allocation with CSV updates and JSON output
    try:
        results = allocator.run_full_allocation(
            update_csv=True,
            save_json=True,
            json_file="patients_allocation.json"
        )
        
        # Display example results
        print("Patient Allocation Summary:")
        print(f"Total Patients: {results['reports']['patient_summary']['Total_Patients']}")
        print(f"Assigned: {results['reports']['patient_summary']['Assigned_Patients']} " + 
              f"({results['reports']['patient_summary']['Assigned_Patients'] / results['reports']['patient_summary']['Total_Patients'] * 100:.1f}%)")
        
        # Hospital utilization
        print("\nHospital Utilization:")
        for hospital, stats in results['reports']['hospital_utilization'].items():
            print(f"{hospital}: {stats['Newly_Assigned']} new patients, {stats['Utilization_Percent']:.1f}% total utilization")
        
        # Report on JSON output
        print(f"\nPatient JSON data saved to 'patients_allocation.json' with {len(results['patients_json'])} patients")
        
        # Display sample of the JSON data
        print("\nSample Patient JSON:")
        if results['patients_json']:
            print(json.dumps(results['patients_json'][0], indent=2))
        
        print("\nCSV files have been updated with allocation results")
    
    except Exception as e:
        print(f"Error in allocation process: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
