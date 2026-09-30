import os
import pypdf
import docx


def extract_text_from_file(file_path: str, file_type: str = "") -> str:
    """
    Safely extracts plain text from PDF or DOCX resume files.
    Returns extracted text string, or fallback message if empty.
    """
    if not os.path.exists(file_path):
        return ""

    ext = os.path.splitext(file_path)[1].lower()
    extracted_text = ""

    try:
        if ext == ".pdf" or "pdf" in file_type.lower():
            reader = pypdf.PdfReader(file_path)
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            extracted_text = "\n".join(text_parts)

        elif ext == ".docx" or "word" in file_type.lower() or "docx" in file_type.lower():
            doc = docx.Document(file_path)
            text_parts = []
            for p in doc.paragraphs:
                if p.text:
                    text_parts.append(p.text)
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text:
                            text_parts.append(cell.text)
            extracted_text = "\n".join(text_parts)
    except Exception as e:
        print(f"[TextExtractionWarning] Could not parse file {file_path}: {e}")
        extracted_text = ""

    return extracted_text.strip()
