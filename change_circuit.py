from stem import Signal
from stem.control import Controller
import re

def get_password_from_torrc(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            if line.startswith("HashedControlPassword"):
                # Extract the hashed password
                match = re.search(r'HashedControlPassword (.+)', line)
                if match:
                    return match.group(1)
    raise ValueError("No HashedControlPassword found in torrc file")

def change_tor_circuit():
    with Controller.from_port(port=9051) as controller:
        controller.authenticate(password='torpw')  # Use the correct password here
        controller.signal(Signal.NEWNYM)
        print("New Tor circuit requested")
        return "Success"

if __name__ == "__main__":
    torrc_path = "./torrc"  # torrc file path
    try:
        #password = get_password_from_torrc(torrc_path)
        print(f"Attempting to authenticate with password from torrc file")
        change_tor_circuit()
        print("Tor circuit changed")
    except Exception as e:
        print(f"An error occurred: {e}")
