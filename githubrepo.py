import requests
import json

url = "http://localhost:4500/githubrepo"

try:
    # Make the HTTP request
    response = requests.get(url)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()

        # Save the JSON data to a file
        with open("github_repo_data.json", "w") as json_file:
            json.dump(data, json_file, indent=2)

        print("JSON data saved successfully.")
    else:
        print(f"Error: Unable to fetch data. Status code: {response.status_code}")
except Exception as e:
    print(f"An error occurred: {str(e)}")
