# Anonymous TOR Browser

The Anonymous TOR Browser is a privacy-focused web browser designed to route all internet traffic through the TOR network, ensuring enhanced anonymity and security. TOR circuits change every 10 seconds to maximize privacy.

## Key Features

- **TOR Integration**: Seamlessly routes all web traffic through the TOR network, providing anonymity and protecting against traffic analysis.
- **Enhanced Privacy**: Blocks third-party trackers and scripts to safeguard user data and browsing history.
- **Secure Connection**: Ensures encrypted communication between the user and websites, protecting sensitive information from eavesdropping.
- **Customizable Proxy Settings**: Allows users to configure proxy settings for added flexibility and control over their browsing experience.
- **User-Friendly Interface**: Designed with simplicity and usability in mind, making it easy for anyone to browse the web securely.
- **Cross-Platform Support**: Available on multiple operating systems to provide a consistent and secure browsing experience across devices.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/jaroslavdusek1/anonymous-tor-browser.git
    ```

2. Navigate to the project directory:
    ```bash
    cd anonymous-tor-browser
    ```

3. Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

4. Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```

5. Generate the TOR hashed password and update the `torrc` file:
    ```bash
    tor --hash-password [YOUR_PASSWORD]
    ```

    Replace `YOUR_PASSWORD` with a password name of your choice. Copy the hashed password that is generated

6. Create and update the `torrc` file with the hashed password:
    ControlPort 9051
    HashedControlPassword 16:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    SocksPort 9050
    CookieAuthentication 1

    Replace 16:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX with the hashed password you generated. Save this content into a file named torrc in the project directory

7. Update the Python script change_circuit.py with your chosen password:
    ```plaintext
    def change_tor_circuit():
    with Controller.from_port(port=9051) as controller:
        controller.authenticate(password='[YOUR_PASSWORD_NAME]')
        controller.signal(Signal.NEWNYM)
        return "Success"
    ```

8. Start the application:
    ```bash
    npm install
    npm start
    ```

## Usage

After starting the application, the browser will open, you can enter URLs and navigate the web with all traffic routed through the TOR network
