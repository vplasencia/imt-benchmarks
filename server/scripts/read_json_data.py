import json

def read_json_data(file_path):
    # Open and read the JSON file
    with open(file_path, 'r') as file:
        data = json.load(file)
    
    return data