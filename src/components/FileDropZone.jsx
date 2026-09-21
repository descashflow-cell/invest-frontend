import { useRef, useState } from "react";
import { transformCsv } from "@/lib/api";

export default function FileDropZone({
  label = "Carica l'estratto conto Trade Republic",
  accept = "*",
  setLoading,
}) {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);

  const handleDrop = (evt) => {
    evt.preventDefault();

    setDragging(false);

    const droppedFile = evt.dataTransfer.files[0];

    if (droppedFile) setFile(droppedFile);
  };

  const handleDragOver = (evt) => {
    evt.preventDefault();
  };

  const handleDragEnter = (evt) => {
    evt.preventDefault();

    setDragging(true);
  };

  const handleDragLeave = (evt) => {
    evt.preventDefault();

    setDragging(false);
  };

  const handleFileSelected = (evt) => {
    const selectedFile = evt.target.files[0];

    if (selectedFile) setFile(selectedFile);
  };

  const transform = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const response = await transformCsv(file);

      const url = window.URL.createObjectURL(response);

      const a = document.createElement("a");
      a.href = url;
      a.download = "snowball.csv";

      document.body.appendChild(a);
      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`border rounded p-5 text-center cursor-pointer ${dragging ? "border-primary bg-light" : "border-secondary"}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept={accept}
          onChange={handleFileSelected}
        />

        <div className="fs-1 mb-3">📄</div>

        <h5>{label}</h5>

        <div className="text-muted">oppure clicca per selezionarlo</div>

        {file && (
          <div className="alert alert-success mt-4 mb-0">
            <strong>{file.name}</strong>
            <br />
            {(file.size / 1024).toFixed(1)} KB
          </div>
        )}
      </div>
      <button
        className="btn btn-primary mt-4"
        disabled={!file}
        onClick={transform}
      >
        {"Trasforma"}
      </button>
    </>
  );
}
