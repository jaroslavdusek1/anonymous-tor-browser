from stem import Signal
from stem.control import Controller

def change_tor_circuit(password):
    with Controller.from_port(port=9051) as controller:
        controller.authenticate(password=password)
        controller.signal(Signal.NEWNYM)
        print("New Tor circuit requested")
        return "Success"

if __name__ == "__main__":
    password = "welcome"
    try:
        print(f"Attempting to authenticate with password: {password}")
        change_tor_circuit(password)
        print("Tor circuit changed")
    except Exception as e:
        print(f"An error occurred: {e}")
