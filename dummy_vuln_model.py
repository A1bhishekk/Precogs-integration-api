# dummy_vuln_model.py
import sys
import json
import random

def scan_code(code):
    vulnerabilities = []

    # Simulate scanning for SQL injection
    if "SQL injection" in code:
        vulnerabilities.append({
            'line of code': random.randint(100, 500),
            'type': 'SQL injection',
            'score': random.uniform(4, 10),
            'fix': 'Update to use parameterized queries',
            'category': 'Security'
        })

    # Simulate scanning for Cross-Site Scripting (XSS)
    if "XSS" in code:
        vulnerabilities.append({
            'line of code': random.randint(100, 500),
            'type': 'XSS',
            'score': random.uniform(5, 10),
            'fix': 'Sanitize user inputs',
            'category': 'Security'
        })

    # Simulate scanning for Denial of Service (DoS)
    if "DoS" in code:
        vulnerabilities.append({
            'line of code': random.randint(100, 500),
            'type': 'DoS',
            'score': random.uniform(7, 10),
            'fix': 'Increase server capacity',
            'category': 'Performance'
        })

    return vulnerabilities



if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Missing code argument")
        sys.exit(1)

    code = sys.argv[1]
    vulnerabilities = scan_code(code)
    print(vulnerabilities)

























# Sample Code
code = """
import database_module

def get_user_data(user_input):
    # Potential SQL injection vulnerability
    query = "SELECT * FROM users WHERE username = '" + user_input + "';"
    result = database_module.execute_query(query)
    return result

def display_message(user_input):
    # Potential XSS vulnerability
    message = "<div>" + user_input + "</div>"
    return message
"""
