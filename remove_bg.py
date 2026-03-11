from rembg import remove
from PIL import Image
import sys

input_path = "d:/fx-master/frontend/public/robot_trader_hero.png"
output_path = "d:/fx-master/frontend/public/robot_trader_hero.png"

try:
    print("Opening image...")
    # Open the image
    input_image = Image.open(input_path)
    print("Removing background...")
    # Remove background
    output_image = remove(input_image)
    print("Saving image...")
    # Save the result, replacing the original
    output_image.save(output_path)
    print("Background removed successfully!")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
