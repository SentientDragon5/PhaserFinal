import json
import os

"""
I did a whoopsie and made my tilemap with the wrong tileset. not my embed one, this fixes the json.

"""


def modify_data(data):
  """Tree recurse through JSON data, modify data fields, and return modified data.

  Args:
    data: The JSON data object.

  Returns:
    The modified JSON data object.
  """
  if isinstance(data, list):
    # Iterate through list elements
    for i in range(len(data)):
      data[i] = modify_data(data[i])
  elif isinstance(data, dict):
    # Iterate through dictionary key-value pairs
    for key, value in data.items():
      if key == "data" and isinstance(value, list) and value:
        # Check for "data" field, list type, and non-empty
        for i in range(len(value)):
          if isinstance(value[i], int) and value[i] > 0:
            # Modify integer values greater than 0 in "data" list
            value[i] -= 512
      else:
        # Recursive call for nested objects
        data[key] = modify_data(value)
  return data


def main():
  
  path = os.path.join(os.getcwd(), 'assets/ruins_map2.tmj')
  # Replace 'your_file.json' with the actual file path
  with open(path, 'r') as f:
    data = json.load(f)

  # Modify data
  modified_data = modify_data(data)

  # Overwrite file with modified data
  with open(path, 'w') as f:
    json.dump(modified_data, f, indent=4)  # Indent for readability


if __name__ == "__main__":
  main()
