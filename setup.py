#!/usr/bin/env python3
"""
Setup script for ICD Prediction System
Checks dependencies and creates necessary folders
"""

import sys
import subprocess
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8+"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}")

def check_dependencies():
    """Check if required packages are installed"""
    required = [
        'flask',
        'flask_cors',
        'pandas',
        'numpy',
        'dotenv',
    ]
    
    missing = []
    for package in required:
        try:
            __import__(package.replace('-', '_'))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing.append(package)
    
    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print("Run: pip install -r requirements.txt")
        return False
    return True

def create_folders():
    """Create necessary folders"""
    folders = [
        'data',
        'models/checkpoints',
        'results',
        'logs',
        'uploads',
        'utils',
        'notebooks',
        'frontend',
    ]
    
    for folder in folders:
        Path(folder).mkdir(parents=True, exist_ok=True)
        print(f"✅ {folder}/")

def check_files():
    """Check if required files exist"""
    files = {
        'data/ICD10codes.csv': 'ICD-10 database',
        'utils/report.txt': 'Sample report',
        '.env': 'Environment config',
    }
    
    for filepath, description in files.items():
        if Path(filepath).exists():
            print(f"✅ {filepath} ({description})")
        else:
            print(f"⚠️  {filepath} ({description}) - NOT FOUND")

def main():
    print("=" * 50)
    print("ICD Prediction System - Setup Check")
    print("=" * 50)
    
    print("\n📋 Checking Python version...")
    check_python_version()
    
    print("\n📦 Checking dependencies...")
    if not check_dependencies():
        print("\n❌ Please install missing dependencies first")
        return
    
    print("\n📁 Creating folders...")
    create_folders()
    
    print("\n📄 Checking required files...")
    check_files()
    
    print("\n" + "=" * 50)
    print("✅ Setup check complete!")
    print("=" * 50)
    print("\n🚀 Next steps:")
    print("1. Ensure .env has GEMINI_API_KEY")
    print("2. Run: python app.py")
    print("3. Open: frontend/index.html")
    print("\nFor more info, see QUICKSTART.md")

if __name__ == '__main__':
    main()
