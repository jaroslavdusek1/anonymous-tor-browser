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


# import os
# from stem import Signal
# from stem.control import Controller

# def get_hashed_password(torrc_path):
#     with open(torrc_path, 'r') as f:
#         for line in f:
#             if line.startswith('HashedControlPassword'):
#                 hashed_password = line.split(' ')[1].strip()
#                 print(f"Using hashed password: {hashed_password}")
#                 return hashed_password
#     raise ValueError('HashedControlPassword not found in torrc file')


# def change_tor_circuit(tor_password):
#     with Controller.from_port(port=9051) as controller:
#         controller.authenticate(password=tor_password)
#         controller.signal(Signal.NEWNYM)

# if __name__ == "__main__":
#     torrc_path = './torrc'

#     try:
#         hashed_password = get_hashed_password(torrc_path)
#         change_tor_circuit(hashed_password)
#         print("Tor circuit changed")
#     except Exception as e:
#         print(f"An error occurred: {e}")
