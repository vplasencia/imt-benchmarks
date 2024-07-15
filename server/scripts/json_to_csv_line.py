import pandas as pd
from read_json_data import read_json_data
import argparse

# Create the parser
parser = argparse.ArgumentParser(description='A script to create the data to generate line charts in Latex.')

# Add arguments
parser.add_argument('file', type=str, help='File name', default='insert')
parser.add_argument('-y1', '--y1', type=str, help='First column', default='IMT')
parser.add_argument('-y2', '--y2', type=str, help='Second column', default='LeanIMT')
parser.add_argument('-dr', '--downsample_rate', type=int, help='Downsample rate', default=100)

# Parse the arguments
args = parser.parse_args()

data = read_json_data(f'./data/{args.file}.json')

samples_df = pd.DataFrame()

size = data[0]["Samples"]

x = [x+1 for x in range(size)]

y1 = data[0]['samples']

y2 = data[1]['samples']

# Downsample data for better visualization
downsample_rate = args.downsample_rate
x = x[::downsample_rate]
y1 = y1[::downsample_rate]
y2 = y2[::downsample_rate]

samples_df["Members"] = x
samples_df[f"{args.y1}"] = y1
samples_df[f"{args.y2}"] = y2

# Save DataFrame to CSV
csv_file_path = f'./data/{args.file}-line.csv'
samples_df.to_csv(csv_file_path, index=False)