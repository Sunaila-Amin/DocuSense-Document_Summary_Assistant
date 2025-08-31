import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import axios from "axios";   // ✅ NEW

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [length, setLength] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setError("");
    setText("");
    setSummary("");
    setNumPages(null);

    if (fileRejections?.length) {
      const msg = fileRejections
        .map((rej) => rej.errors.map((e) => e.message).join(", "))
        .join("\n");
      setError("File rejected: " + msg);
      return;
    }

    const f = acceptedFiles[0];
    if (!f) return;

    setFile(f);

    if (f.type === "application/pdf") {
      setPreview(URL.createObjectURL(f));
    } else if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"],
    },
    multiple: false,
  });

  // ✅ Updated to use Axios
  const callApi = async (path) => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      if (path === "summarize") fd.append("length", length);

      const res = await axios.post(`http://127.0.0.1:5000/${path}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;

      if (path === "extract") {
        if (data.error) throw new Error(data.error);
        setText(data.text || "No text extracted.");
      } else {
        if (data.error) throw new Error(data.error);
        setSummary(data.summary || "No summary generated.");
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Something went wrong. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setNumPages(null);
    setText("");
    setSummary("");
    setError("");
    setLength("medium");
  };

  const CopyBtn = ({ value }) => (
    <button
      onClick={() => navigator.clipboard.writeText(value || "")}
      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-400 to-red-400 text-white text-sm hover:opacity-90 flex items-center gap-1 shadow-md"
      title="Copy to clipboard"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      Copy
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50 px-4">
      <div className="w-full max-w-3xl">

        {/* <-- ADDED SINGLE HEADING LINE (only change) */}
        <h1 className="text-4xl font-extrabold text-indigo-700 text-center mb-6">DocuSense</h1>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
            Document Summary Assistant
          </h1>
          <p className="text-gray-600 mt-2">
            Upload PDFs or images to generate <span className="font-semibold text-pink-600">AI-powered summaries</span>
          </p>
        </div>

        {/* Upload Box */}
        <div
          {...getRootProps()}
          className={`rounded-2xl border-2 border-dashed p-12 text-center transition cursor-pointer shadow-lg backdrop-blur
          ${isDragActive ? "border-pink-400 bg-pink-50" : "border-indigo-200 bg-white hover:border-indigo-400"}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-700">
              {file ? file.name : "Upload your document"}
            </p>
            <p className="text-sm text-gray-500">
              Drag & drop a PDF or image here, or click to browse
            </p>
            <p className="text-xs text-gray-400">PDF / Image • Up to 10MB</p>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="mt-6">
            {file?.type === "application/pdf" ? (
              <div className="border rounded-lg p-3 shadow">
                <Document
                  file={file}
                  onLoadError={(err) => console.error("error:", )}
                  noData="" 
                >
                </Document>

                
              </div>
            ) : (
              <img
                src={file}
                alt="preview"
                className="rounded-lg shadow-lg border max-h-[420px] mx-auto"
              />
            )}
          </div>
        )}

        {/* Actions */}
        {file && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              onClick={() => callApi("extract")}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Processing…" : "Extract Text"}
            </button>

            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium">Summary length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="border rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-pink-400"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>

            <button
              onClick={() => callApi("summarize")}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Summarizing…" : "Summarize"}
            </button>

            <button
              onClick={clearAll}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold shadow-md hover:opacity-90 disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="flex items-center gap-2 mt-4 text-indigo-600">
            <div className="w-5 h-5 border-4 border-pink-300 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Working…</span>
          </div>
        )}
        {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}

        {/* Output */}
        {text && (
          <div className="mt-6 bg-gradient-to-br from-white to-indigo-50 p-5 rounded-lg shadow-inner border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-indigo-700">Extracted Text</h2>
              <CopyBtn value={text} />
            </div>
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{text}</p>
          </div>
        )}

        {summary && (
          <div className="mt-6 bg-gradient-to-br from-white to-pink-50 p-5 rounded-lg shadow-inner border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-pink-700">Summary</h2>
              <CopyBtn value={summary} />
            </div>
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{summary}</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-14 text-center text-gray-600 text-sm">
          <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">
            📘 DocuSense
          </div>
          <p className="mt-1">Beautiful AI-powered document summarizer</p>
        </footer>
      </div>
    </div>
  );
}
