import sys

def try_read():
    try:
        import fitz
        doc = fitz.open(sys.argv[1])
        for page in doc:
            print(page.get_text())
        return
    except Exception as e:
        print(f"PyMuPDF failed: {e}")
        
    try:
        import PyPDF2
        with open(sys.argv[1], "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                print(page.extract_text())
        return
    except Exception as e:
        print(f"PyPDF2 failed: {e}")

try_read()
