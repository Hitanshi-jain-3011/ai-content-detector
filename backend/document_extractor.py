"""
document_extractor.py — Text extraction utilities for PDF, DOCX, and TXT files.

Extracts text content cleanly and safely from in-memory byte streams,
handling corrupted files, encoding variations, and multi-page documents.
"""

import io
import os
import re
import zipfile
import pypdf
import docx
import pytesseract

from pdf2image import convert_from_bytes
from PIL import Image


# ---------------------------------------------------------------------------
# Poppler configuration (Windows)
# pdf2image shells out to Poppler binaries (pdfinfo, pdftoppm) to convert
# PDF pages into images. Without Poppler, OCR fallback cannot run.
# ---------------------------------------------------------------------------
POPPER_BIN_PATH = r"C:\Users\hitan\Downloads\Release-26.09.0-0 (1)\poppler-26.09.0\Library\bin"

TESSERACT_EXE = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def _resolve_poppler_path() -> str:
    """
    Returns the Poppler bin directory if it exists on disk.
    Raises ValueError with actionable Windows install instructions otherwise.
    """
    if POPPER_BIN_PATH and os.path.isdir(POPPER_BIN_PATH):
        return POPPER_BIN_PATH

    raise ValueError(
        "Poppler is not installed. pdf2image needs Poppler binaries "
        "(pdfinfo, pdftoppm) to convert PDF pages into images for OCR. "
        "Install Poppler on Windows: "
        "1. Download the prebuilt release from "
        "https://github.com/oschwartz/poppler-windows/releases/latest "
        "2. Extract the .7z archive (e.g. poppler-XX.X.X-windows.7z) "
        "to any folder, for example C:\\poppler. "
        "3. Set POPPER_BIN_PATH in document_extractor.py to that folder's "
        "'Library\\bin' subdirectory, or add it to your system PATH."
    )


def clean_extracted_text(text: str) -> str:
    """
    Normalizes extracted raw text by collapsing consecutive whitespace
    and removing non-printable control characters while preserving readability.
    """
    if not text:
        return ""
    # Normalize multiple whitespace, form feeds, and non-standard spacing
    cleaned = re.sub(r'[\r\n\t]+', ' ', text)
    cleaned = re.sub(r'\s{2,}', ' ', cleaned)
    return cleaned.strip()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from a PDF.

    First tries pypdf for normal text-based PDFs.
    If little/no text is found, uses OCR with Tesseract
    for scanned/image-based PDFs.
    """

    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))

        if reader.is_encrypted:
            try:
                result = reader.decrypt("")
                if not result:
                    raise ValueError(
                        "The uploaded PDF is password-protected and cannot be read."
                    )
            except Exception:
                raise ValueError(
                    "The uploaded PDF is password-protected and cannot be read."
                )

        # -------------------------------------------------
        # STEP 1: Try normal PDF text extraction
        # -------------------------------------------------
        extracted_pages = []

        for index, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()

                if page_text and page_text.strip():
                    extracted_pages.append(page_text)

            except Exception as page_err:
                print(
                    f"Warning: Failed to extract text from page "
                    f"{index + 1}: {page_err}"
                )

        full_text = clean_extracted_text("\n".join(extracted_pages))

        # If normal text was found, return it
        if len(full_text.strip()) >= 20:
            return full_text

        # -------------------------------------------------
        # STEP 2: PDF has little/no text -> use OCR
        # -------------------------------------------------
        print("No sufficient PDF text found. Starting OCR...")

        # Resolve Poppler path (raises a clear error if missing)
        poppler_path = _resolve_poppler_path()

        # Tell pytesseract exactly where Tesseract is installed
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE

        # Convert PDF pages into images using the resolved Poppler path
        images = convert_from_bytes(
            file_bytes,
            dpi=200,
            fmt="png",
            poppler_path=poppler_path,
        )

        ocr_pages = []

        for index, image in enumerate(images):
            try:
                text = pytesseract.image_to_string(
                    image,
                    lang="eng"
                )

                if text and text.strip():
                    ocr_pages.append(text)

                print(f"OCR completed for page {index + 1}")

            except Exception as ocr_page_err:
                raise ValueError(
                    f"OCR failed on page {index + 1}: {ocr_page_err}"
                )

        ocr_text = clean_extracted_text("\n".join(ocr_pages))

        if ocr_text:
            return ocr_text

        raise ValueError(
            "No readable text could be extracted from this PDF. "
            "The PDF may be empty, corrupted, or contain an unreadable image."
        )

    except pypdf.errors.PdfReadError as pdf_err:
        raise ValueError(
            f"Corrupted or invalid PDF file: {str(pdf_err)}"
        )

    except Exception as err:
        if isinstance(err, ValueError):
            raise

        raise ValueError(
            f"Unable to parse PDF file: {str(err)}"
        )


def extract_text_from_docx(file_bytes: bytes) -> str:
    """
    Extracts text from DOCX document bytes using python-docx.

    Args:
        file_bytes (bytes): Binary content of the DOCX file.

    Returns:
        str: Cleaned text extracted from paragraphs and tables.

    Raises:
        ValueError: If DOCX package is corrupted or unreadable.
    """
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        extracted_chunks = []

        # 1. Extract paragraphs
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                extracted_chunks.append(paragraph.text)

        # 2. Extract table cells
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        extracted_chunks.append(cell.text)

        full_text = "\n".join(extracted_chunks)
        return clean_extracted_text(full_text)

    except (zipfile.BadZipFile, docx.opc.exceptions.PackageNotFoundError) as docx_err:
        raise ValueError(f"Corrupted or invalid DOCX document: {str(docx_err)}")
    except Exception as err:
        if isinstance(err, ValueError):
            raise
        raise ValueError(f"Unable to parse DOCX document: {str(err)}")


def extract_text_from_txt(file_bytes: bytes) -> str:
    """
    Extracts and decodes plain text from TXT file bytes.
    Supports UTF-8, UTF-8-BOM, Latin-1, and Windows-1252 encodings.

    Args:
        file_bytes (bytes): Binary content of the TXT file.

    Returns:
        str: Cleaned decoded text string.

    Raises:
        ValueError: If text cannot be decoded with standard encodings.
    """
    encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]

    for encoding in encodings:
        try:
            decoded = file_bytes.decode(encoding)
            return clean_extracted_text(decoded)
        except UnicodeDecodeError:
            continue

    raise ValueError("Unable to decode TXT file. Unsupported character encoding.")