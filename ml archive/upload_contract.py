"""
Interactive script to upload your own contract for analysis.
"""
import sys
from utils.contract_uploader import ContractUploader
from pathlib import Path


def main():
    print("=" * 60)
    print("Artist Contract Uploader")
    print("=" * 60)
    print()
    
    uploader = ContractUploader()
    
    # Ask user how they want to provide the contract
    print("How would you like to upload your contract?")
    print("1. From a text file (.txt)")
    print("2. Paste text directly")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '1':
        # Upload from file
        file_path = input("\nEnter the path to your contract file: ").strip().strip('"')
        
        try:
            contract_type = input("What type of contract is this? (e.g., Record Deal, Management Agreement): ").strip()
            contract = uploader.upload_from_file(file_path)
            contract['type'] = contract_type or "User Uploaded"
            
            print("\n" + "=" * 60)
            print("Contract uploaded successfully!")
            print("=" * 60)
            print(f"Contract ID: {contract['id']}")
            print(f"Contract Type: {contract['type']}")
            print(f"Text Length: {len(contract['text'])} characters")
            print()
            print("Next steps:")
            print("1. Add this contract to your experiment by modifying main.py")
            print("2. Or run: python main.py")
            print()
            
        except Exception as e:
            print(f"\n✗ Error uploading contract: {e}")
            return 1
    
    elif choice == '2':
        # Paste text directly
        print("\nPaste your contract text below. Press Ctrl+D (Ctrl+Z on Windows) twice when done:")
        print("-" * 60)
        
        try:
            lines = []
            if sys.platform == 'win32':
                print("(Press Ctrl+Z then Enter when done)")
            else:
                print("(Press Ctrl+D when done)")
            
            while True:
                try:
                    line = input()
                    lines.append(line)
                except EOFError:
                    break
            
            contract_text = '\n'.join(lines)
            
            if not contract_text.strip():
                print("\n✗ No text entered.")
                return 1
            
            contract_type = input("\nWhat type of contract is this? (e.g., Record Deal, Management Agreement): ").strip()
            
            contract = uploader.upload_from_text(contract_text, contract_type or "User Uploaded")
            
            print("\n" + "=" * 60)
            print("Contract uploaded successfully!")
            print("=" * 60)
            print(f"Contract ID: {contract['id']}")
            print(f"Contract Type: {contract['type']}")
            print(f"Text Length: {len(contract['text'])} characters")
            print()
            print("Next steps:")
            print("1. Add this contract to your experiment by modifying main.py")
            print("2. Or run: python main.py")
            print()
            
        except Exception as e:
            print(f"\n✗ Error uploading contract: {e}")
            return 1
    
    elif choice == '3':
        print("\nGoodbye!")
        return 0
    
    else:
        print("\n✗ Invalid choice.")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

