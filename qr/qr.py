import qrcode
from PIL import Image
import socket

def get_mac_ip_address():
    """
    Get the IP address of the Mac machine on the local network.
    Returns the first non-localhost IPv4 address found.
    """
    try:
        # Get the hostname
        hostname = socket.gethostname()
        
        # Get all IP addresses associated with the hostname
        ip_addresses = socket.getaddrinfo(hostname, None)
        
        # Filter for IPv4 addresses that are not localhost
        for ip_info in ip_addresses:
            # Check if it's IPv4 (AF_INET)
            if ip_info[0] == socket.AF_INET:
                ip = ip_info[4][0]
                # Skip localhost addresses
                if not ip.startswith('127.'):
                    return ip
        
        # Fallback method if the above doesn't work
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # This doesn't actually establish a connection
        s.connect(('8.8.8.8', 1))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception as e:
        print(f"Error getting IP address: {e}")
        return None

def generate_qr_code(url=None, port=8000, filename="qrcode.png"):
    """
    Generate a QR code for the given URL and save it to a file.
    If no URL is provided, uses the Mac's IP address with the specified port.
    
    Args:
        url (str, optional): The URL to encode in the QR code. If None, uses Mac's IP.
        port (int): The port to use if generating URL from IP address. Default is 8000.
        filename (str): The name of the file to save the QR code to. Default is "qrcode.png".
    """
    # Create qr code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    
    # If no URL is provided, use the Mac's IP address
    if url is None:
        ip_address = get_mac_ip_address()
        if ip_address:
            url = f"http://{ip_address}:{port}"
            print(f"Using detected IP address: {url}")
        else:
            url = f"http://localhost:{port}"
            print(f"Could not detect IP address, using: {url}")
    
    # Add data to the QR code
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create an image from the QR code
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save the image
    img.save(filename)
    print(f"QR code generated and saved as {filename}")
    
    # Return the URL for reference
    return url

def open_with_preview(filename):
    """
    Open the image file with macOS Preview app
    
    Args:
        filename (str): Path to the image file
    """
    import subprocess
    import os
    import platform
    
    if platform.system() == 'Darwin':  # Check if running on macOS
        # Get the absolute path to the file
        filepath = os.path.abspath(filename)
        
        # Use subprocess to open the file with Preview
        subprocess.run(['open', '-a', 'Preview', filepath])
        print(f"Opened {filename} with Preview")
    else:
        print("This function only works on macOS")
        # Fall back to default viewer on other platforms
        import webbrowser
        webbrowser.open(filename)

if __name__ == "__main__":
    # Generate QR code using the Mac's IP address and port 8000
    filename = "qrcode.png"
    generated_url = generate_qr_code(filename=filename)
    
    # Open the generated QR code with Preview app
    open_with_preview(filename)