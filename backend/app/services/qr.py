import qrcode
from io import BytesIO
import base64

def generate_cattle_qr(cattle_id: str):
    """
    Generate a QR code for a specific cattle profile.
    Returns a base64 encoded image string.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    # URL would point to the frontend profile page
    data = f"https://cattleos.app/cattle/{cattle_id}"
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"
