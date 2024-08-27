import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.ticker import FuncFormatter

df = pd.read_csv('./data/functions-browser-bar.csv')

# Data provided
functions = df["Function"]
imt = df["IMT"]
lean_imt = df["LeanIMT"]

# Create the bar chart
x = np.arange(len(df["Function"]))  # label locations
width = 0.35  # width of the bars

fig, ax = plt.subplots()
bars1 = ax.bar(x - width/2, imt, width, color='#60a5fa', edgecolor="#2563eb", label='IMT')
bars2 = ax.bar(x + width/2, lean_imt, width, color='#4ade80', edgecolor="#16a34a", label='LeanIMT')

# Set logarithmic scale
ax.set_yscale('log')

# Add some text for labels, title, and custom x-axis tick labels, etc.
ax.set_xlabel('Function')
ax.set_ylabel('Average Time (ms)')
ax.set_title('Functions IMT vs LeanIMT (100 iterations)')
ax.set_xticks(x)
ax.set_xticklabels(functions)
ax.legend()

# Custom formatter to display tick labels as plain numbers without scientific notation
def log_format(y, pos):
    if y >= 1:
        return f'{int(y)}'
    else:
        # For values less than 1, calculate the number of zeros after the decimal point
        decimal_places = -int(np.log10(y))
        formatted_value = f'{{:.{decimal_places}f}}'.format(y)
        return formatted_value

ax.yaxis.set_major_formatter(FuncFormatter(log_format))

ax.set_axisbelow(True)
ax.grid(color='lightgray')

# Display the plot
plt.show()
