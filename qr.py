import qrcode

# Data you want to encode (can be a website link or text)
data = "https://chiromo-tech-club.vercel.app/register"

# Generate the QR code
img = qrcode.make(data)

# Save the image to your directory
img.save("basic_qr.png")

print("Basic QR Code generated successfully!")
