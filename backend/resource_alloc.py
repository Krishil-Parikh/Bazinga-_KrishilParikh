import pandas as pd
import numpy as np
import pulp as pl
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns

class HealthcareResourceAllocator:
    def __init__(self, patients_file, hospitals_file, suppliers_file):
        """Initialize the resource allocator with data files."""
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
    
    def visualize_allocation(self):
        """Create visualizations of the allocation results."""
        if self.allocation_results is None:
            raise ValueError("Must run optimize_allocation() first")
        
        # Check if visualization dependencies are available
        try:
            import matplotlib.pyplot as plt
            import seaborn as sns
        except ImportError:
            print("Visualization dependencies (matplotlib, seaborn) not available.")
            return None
        
        # Create a figure with multiple subplots
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # 1. Patient assignment by hospital
        hospital_counts = self.allocation_results['Assigned_Hospital'].value_counts()
        sns.barplot(x=hospital_counts.index, y=hospital_counts.values, ax=axes[0,0])
        axes[0,0].set_title('Patient Assignments by Hospital')
        axes[0,0].set_xticklabels(axes[0,0].get_xticklabels(), rotation=45, ha='right')
        
        # 2. Assignment by patient region
        region_counts = self.allocation_results.groupby('Patient_Region')['Assigned_Hospital'].apply(
            lambda x: sum(x != 'Unassigned')).reset_index()
        region_counts.columns = ['Region', 'Assigned Patients']
        sns.barplot(x='Region', y='Assigned Patients', data=region_counts, ax=axes[0,1])
        axes[0,1].set_title('Patient Assignments by Region')
        
        # 3. Regional match percentage
        match_pct = self.allocation_results[self.allocation_results['Assigned_Hospital'] != 'Unassigned']
        if not match_pct.empty:
            match_pct = match_pct.groupby('Patient_Region')['Is_Regional_Match'].mean() * 100
            match_pct = match_pct.reset_index()
            match_pct.columns = ['Region', 'Regional Match Percentage']
            sns.barplot(x='Region', y='Regional Match Percentage', data=match_pct, ax=axes[1,0])
            axes[1,0].set_title('Regional Match Percentage')
        else:
            axes[1,0].set_title('No Regional Match Data Available')
        
        # 4. Assignment by MEWS score if available
        if 'MEWS_Score' in self.allocation_results.columns:
            try:
                mews_groups = pd.cut(self.allocation_results['MEWS_Score'], bins=[0, 2, 4, 6, 9], 
                                    labels=['0-2', '3-4', '5-6', '7-9'])
                mews_assigned = self.allocation_results.groupby(mews_groups)['Assigned_Hospital'].apply(
                    lambda x: sum(x != 'Unassigned') / len(x) * 100 if len(x) > 0 else 0).reset_index()
                mews_assigned.columns = ['MEWS Score', 'Percentage Assigned']
                sns.barplot(x='MEWS Score', y='Percentage Assigned', data=mews_assigned, ax=axes[1,1])
                axes[1,1].set_title('Assignment Rate by MEWS Score')
            except:
                axes[1,1].set_title('MEWS Score Analysis Unavailable')
        else:
            axes[1,1].set_title('MEWS Score Data Not Available')
        
        plt.tight_layout()
        return fig
    
    def run_full_allocation(self):
        """Run the complete allocation process and return results."""
        patient_allocation = self.optimize_allocation()
        
        try:
            supplier_allocation = self.allocate_supplier_resources()
        except Exception as e:
            print(f"Warning: Supplier allocation failed with error: {e}")
            supplier_allocation = pd.DataFrame()
            
        reports = self.generate_reports()
        
        return {
            'patient_allocation': patient_allocation,
            'supplier_allocation': supplier_allocation,
            'reports': reports
        }


# Example usage
def main():
    # Create the allocator (using actual file paths)
    allocator = HealthcareResourceAllocator('/Users/krishilparikh/Synergy/backend/Triage Flagging/final_synthetic_triage_data.csv', 'hospitals.csv', 'supplier.csv')
    
    # Run the allocation
    try:
        results = allocator.run_full_allocation()
        
        # Display example results
        print("Patient Allocation Summary:")
        print(f"Total Patients: {results['reports']['patient_summary']['Total_Patients']}")
        print(f"Assigned: {results['reports']['patient_summary']['Assigned_Patients']} " + 
              f"({results['reports']['patient_summary']['Assigned_Patients'] / results['reports']['patient_summary']['Total_Patients'] * 100:.1f}%)")
        
        if 'Regional_Matches' in results['reports']['patient_summary']:
            print(f"Regional Matches: {results['reports']['patient_summary']['Regional_Matches']}")
        
        # Hospital utilization
        print("\nHospital Utilization:")
        for hospital, stats in results['reports']['hospital_utilization'].items():
            print(f"{hospital}: {stats['Newly_Assigned']} new patients, {stats['Utilization_Percent']:.1f}% total utilization")
        
        # Sample of patient assignments
        print("\nSample Patient Assignments:")
        print(results['patient_allocation'].head())
        
        # Sample of supplier allocations
        print("\nSample Supplier Allocations:")
        print(results['supplier_allocation'].head() if not results['supplier_allocation'].empty else "No supplier allocations needed")
        
        # Create and save visualizations
        try:
            fig = allocator.visualize_allocation()
            if fig:
                fig.savefig('allocation_results.png')
                print("\nVisualization saved as 'allocation_results.png'")
        except Exception as e:
            print(f"Visualization failed: {e}")
    
    except Exception as e:
        print(f"Error in allocation process: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()