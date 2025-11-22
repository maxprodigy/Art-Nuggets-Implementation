import os
import json
from pathlib import Path
from typing import Dict, List


class ContractUploader:
    """Handles upload and processing of user contract files."""
    
    def __init__(self):
        self.uploaded_dir = Path("data/uploaded_contracts")
        self.uploaded_dir.mkdir(parents=True, exist_ok=True)
    
    def upload_from_file(self, file_path: str) -> Dict:
        """
        Upload a contract from a file.
        
        Args:
            file_path: Path to the contract file (.txt, .pdf, etc.)
        
        Returns:
            Dict with contract data
        """
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(f"Contract file not found: {file_path}")

        suffix = file_path.suffix.lower()

        # Read the contract text for supported formats
        if suffix == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                contract_text = f.read()

        elif suffix == '.pdf':
            # Lazy import to keep optional dependency until needed
            try:
                import pdfplumber
            except Exception as e:
                raise ImportError("pdfplumber is required to extract text from PDFs. Install with 'pip install pdfplumber'") from e

            contract_text_parts = []
            with pdfplumber.open(str(file_path)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        contract_text_parts.append(page_text)

            contract_text = "\n\n".join(contract_text_parts).strip()

        elif suffix == '.docx':
            try:
                from docx import Document
            except Exception as e:
                raise ImportError("python-docx is required to extract text from DOCX files. Install with 'pip install python-docx'") from e

            doc = Document(str(file_path))
            paragraphs = [p.text for p in doc.paragraphs if p.text]
            contract_text = "\n".join(paragraphs).strip()

        else:
            raise ValueError(f"Unsupported file format: {suffix}. Supported: .txt, .pdf, .docx")
        
    # Generate a contract ID
    contract_id = f"uploaded_{len(list(self.uploaded_dir.glob('*.txt')))+1}"
        
    # Save uploaded contract as text (normalize everything to .txt for downstream processing)
    uploaded_file = self.uploaded_dir / f"{contract_id}.txt"
    uploaded_file.write_text(contract_text, encoding='utf-8')
        
        # Create contract dict
        contract = {
            "id": contract_id,
            "type": "User Uploaded",
            "text": contract_text,
            "ground_truth": {}  # Will need manual annotation for evaluation
        }
        
        print(f"✓ Contract uploaded successfully: {contract_id}")
        print(f"  File saved to: {uploaded_file}")
        
        return contract
    
    def upload_from_text(self, text: str, contract_type: str = "User Uploaded") -> Dict:
        """
        Upload a contract from text string.
        
        Args:
            text: Contract text content
            contract_type: Type of contract (e.g., "Record Deal", "Management Agreement")
        
        Returns:
            Dict with contract data
        """
        # Generate a contract ID
        contract_id = f"uploaded_{len(list(self.uploaded_dir.glob('*.txt')))+1}"
        
        # Save uploaded contract
        uploaded_file = self.uploaded_dir / f"{contract_id}.txt"
        uploaded_file.write_text(text, encoding='utf-8')
        
        # Create contract dict
        contract = {
            "id": contract_id,
            "type": contract_type,
            "text": text,
            "ground_truth": {}  # Will need manual annotation for evaluation
        }
        
        print(f"✓ Contract uploaded successfully: {contract_id}")
        print(f"  Type: {contract_type}")
        print(f"  File saved to: {uploaded_file}")
        
        return contract
    
    def get_uploaded_contracts(self) -> List[Dict]:
        """
        Load all previously uploaded contracts.
        
        Returns:
            List of contract dictionaries
        """
        contracts = []
        
        for txt_file in self.uploaded_dir.glob("*.txt"):
            contract_text = txt_file.read_text(encoding='utf-8')
            contract_id = txt_file.stem
            
            contracts.append({
                "id": contract_id,
                "type": "User Uploaded",
                "text": contract_text,
                "ground_truth": {}
            })
        
        return contracts
    
    def add_ground_truth(self, contract_id: str, ground_truth: Dict):
        """
        Add ground truth annotations for uploaded contract.
        
        Args:
            contract_id: ID of the uploaded contract
            ground_truth: Dict with ground truth labels
        """
        # Save ground truth as JSON
        gt_file = self.uploaded_dir / f"{contract_id}_ground_truth.json"
        with open(gt_file, 'w') as f:
            json.dump(ground_truth, f, indent=2)
        
        print(f"✓ Ground truth saved for {contract_id}")

