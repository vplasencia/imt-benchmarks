import pandas as pd
from read_json_data import read_json_data
import argparse

# Create the parser
parser = argparse.ArgumentParser(description='A script to create the data to generate bar charts in Latex.')

# Add arguments
parser.add_argument('-nodefile', type=str, help='Node.js file name', default='functions-bar')

# Add arguments
parser.add_argument('-browserfile', type=str, help='Browser file name', default='functions-browser-bar')

# Parse the arguments
args = parser.parse_args()

# Get file path
nodejs_file = f'./data/{args.nodefile}.csv'
browser_file = f'./data/{args.browserfile}.csv'

# Create a data frame with the csv file
nodejs_df = pd.read_csv(nodejs_file)
browser_df = pd.read_csv(browser_file)

# Create a result data frame
df = pd.DataFrame()

df["Function"] = nodejs_df['Function']

df["Node.js"] = nodejs_df["LeanIMT"]

df["Browser"] = browser_df["LeanIMT"]

# Save DataFrame to CSV
csv_file_path = './data/leanimt-nodejs-browser-bar.csv'
df.to_csv(csv_file_path, index=False)