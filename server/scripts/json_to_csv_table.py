import pandas as pd
from read_json_data import read_json_data
import argparse

# Create the parser
parser = argparse.ArgumentParser(description='A script to create the data to generate tables in Latex.')

# Add arguments
parser.add_argument('file', type=str, help='Size of the list')

# Parse the arguments
args = parser.parse_args()

data = read_json_data(f'./data/{args.file}.json')

# Convert JSON data to DataFrame
df = pd.DataFrame(data)

table_df = df[['Function', 'ops/sec', 'Average Time (ms)', 'Relative to IMT']]

# Save DataFrame to CSV
csv_file_path = f'./data/{args.file}-table.csv'
table_df.to_csv(csv_file_path, index=False)