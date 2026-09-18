// API service for communicating with the FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Sends raw text to the FastAPI backend for AI content analysis.
 * 
 * @param {string} text - User submitted text
 * @returns {Promise<{id: number, ai_probability: number, human_probability: number, details: object}>}
 */
export async function analyzeText(text) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.detail || `Request failed with status code ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        'Cannot connect to backend server. Make sure FastAPI is running on http://127.0.0.1:8000'
      );
    }
    throw err;
  }
}

/**
 * Uploads a document (PDF, DOCX, or TXT) to the backend for text extraction and AI analysis.
 * 
 * @param {File} file - User selected File object
 * @returns {Promise<{id: number, filename: string, ai_probability: number, human_probability: number, details: object}>}
 */
export async function analyzeFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/analyze/file`, {
      method: 'POST',
      body: formData,
      // Note: do NOT set Content-Type header manually so the browser sets the multipart boundary
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.detail || `File upload failed with status code ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        'Cannot connect to backend server. Make sure FastAPI is running on http://127.0.0.1:8000'
      );
    }
    throw err;
  }
}

/**
 * Uploads an image (JPG, JPEG, PNG, WEBP) to the backend for OCR text extraction
 * and AI content analysis.
 *
 * @param {File} file - User selected image File object
 * @returns {Promise<{id: number, filename: string, ai_probability: number, human_probability: number, details: object, extracted_text?: string}>}
 */
export async function analyzeImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/analyze/image`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.detail || `Image upload failed with status code ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        'Cannot connect to backend server. Make sure FastAPI is running on http://127.0.0.1:8000'
      );
    }
    throw err;
  }
}

/**
 * Retrieves all saved analyses from the database (newest first).
 * 
 * @returns {Promise<Array<object>>}
 */
export async function getAnalyses() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyses`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || `Failed to fetch history (${response.status})`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        'Cannot connect to backend server. Make sure FastAPI is running on http://127.0.0.1:8000'
      );
    }
    throw err;
  }
}

/**
 * Retrieves a single analysis record by its ID.
 * 
 * @param {number} id - Record ID
 * @returns {Promise<object>}
 */
export async function getAnalysis(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyses/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || `Failed to fetch analysis (${response.status})`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        'Cannot connect to backend server. Make sure FastAPI is running on http://127.0.0.1:8000'
      );
    }
    throw err;
  }
}

/**
 * Deletes an analysis record from the database.
 * 
 * @param {number} id - Record ID
 * @returns {Promise<{status: string, message: string}>}
 */
export async function deleteAnalysis(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyses/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || `Failed to delete record (${response.status})`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        'Cannot connect to backend server. Make sure FastAPI is running on http://127.0.0.1:8000'
      );
    }
    throw err;
  }
}

/**
 * Checks server health.
 * 
 * @returns {Promise<{status: string, message: string}>}
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return response.json();
}
