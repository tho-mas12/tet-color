import sys
import os

# Add backend directory to path so imports like `database`, `models`, `schemas` work seamlessly
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
