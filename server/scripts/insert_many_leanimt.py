import matplotlib.pyplot as plt
from read_json_data import read_json_data
import numpy as np

data = read_json_data('./data/insert-many-leanimt.json')

samplesSize = len(data[0]['samples'])

x = [x+1 for x in range(samplesSize)]

y1 = data[0]['samples']

y2 = data[1]['samples']

# plot
fig, ax = plt.subplots()

ax.plot(x, y1, linewidth=2, color='#3b82f6', label='IMT')
ax.plot(x, y2, linewidth=2, color='#ec4899', label='LeanIMT')

# ax.set(xlim=(0, 1000),ylim=(0, 1000))

# Add titles and labels
ax.set_title('Insert vs Insert Many LeanIMT')
ax.set_xlabel('Members')
ax.set_ylabel('Time (ms)')

# Add a grid
plt.grid(True)

# Add a legend
ax.legend()

# Display the plot
plt.show()