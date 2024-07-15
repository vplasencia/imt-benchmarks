import pandas as pd
from read_json_data import read_json_data
import argparse

# Create the parser
parser = argparse.ArgumentParser(description='A script to create the data to generate bar charts in Latex.')

# Add arguments
parser.add_argument('file', type=str, help='File name', default='insert')

# Parse the arguments
args = parser.parse_args()

data = read_json_data(f'./data/{args.file}.json')

df = pd.DataFrame()

data_dict = {}

# Get a dictionary with the Functions name and the list of data structure names for that function
for item in data:
    [ data_structure, function_name ] = item["Function"].split(" - ")
    if(function_name in data_dict):
        data_dict[function_name].append(data_structure)
    else:
        data_dict[function_name] = [data_structure]

# Get the list of keys
data_dict_keys = list(data_dict.keys())
# Get the list of values
data_dict_values = list(data_dict.values())

# Dictionary to save the data structure names with the list of values
data_structures_values = {}

# Initialize the dictionary with empty lists
for value in data_dict_values[0]:
    data_structures_values[value] = []
    
# Add the values to the data_structures_values dictionary
for item in data:
    [ data_structure, _ ] = item["Function"].split(" - ")
    data_structures_values[data_structure] = item["Average Time (ms)"]
    
# Add the functiona names to the data frame
df["Function"] = data_dict_keys

# Add all the values per data structure
for value in data_dict_values[0]:
    df[value] = data_structures_values[value]

# Save DataFrame to CSV
csv_file_path = f'./data/{args.file}-bar.csv'
df.to_csv(csv_file_path, index=False)