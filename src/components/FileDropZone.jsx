import { useRef, useState } from "react";
import { transformCsv } from "@/lib/api";
import FullscreenLoader from "@/components/FullscreenLoader";

export default function FileDropZone({
  label = "Carica l'estratto conto Trade Republic",
  accept = "*",
}) {
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const dragCounter = useRef(0);

  const handleDrop = (evt) => {
    evt.preventDefault();

    dragCounter.current = 0;
    setDragging(false);

    const droppedFile = evt.dataTransfer.files[0];

    if (droppedFile) setFile(droppedFile);
  };

  const handleDragOver = (evt) => {
    evt.preventDefault();
  };

  const handleDragEnter = (evt) => {
    evt.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setDragging(true);
    }
  };

  const handleDragLeave = (evt) => {
    evt.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const handleFileSelected = (evt) => {
    const selectedFile = evt.target.files[0];

    if (selectedFile) setFile(selectedFile);
  };

  const transform = async () => {
    if (!file) return;

    setLoading(true);

    try {
      setErrorMessage("");
      const response = await transformCsv(file);

      const url = window.URL.createObjectURL(response);

      const a = document.createElement("a");
      a.href = url;
      a.download = "snowball.csv";

      document.body.appendChild(a);
      a.click();

      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErrorMessage("Failed to transform CSV. Please try again.");
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <>
      {loading && <FullscreenLoader />}
      {!loading && (
        <div
          data-testid="transform-csv"
          className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 h-full flex flex-col min-h-[340px] gap-4"
        >
          <h2 className="font-display text-3xl tracking-tighter font-light text-center">
            Transform your CSV
          </h2>
          <div className="flex flex-col items-center gap-4">
            <select className="sm:col-span-4 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20">
              <option value="" className="text-black">
                Select source
              </option>
              {["Trade Republic"].map((source) => (
                <option
                  key={source}
                  value={source.toLowerCase()}
                  className="text-black"
                >
                  {source}
                </option>
              ))}
            </select>
            <select className="sm:col-span-4 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20">
              <option value="" className="text-black">
                Select destination
              </option>
              {["Snowball"].map((dest) => (
                <option
                  key={dest}
                  value={dest.toLowerCase()}
                  className="text-black"
                >
                  {dest}
                </option>
              ))}
            </select>
            <div
              id="file-drop-zone"
              className={`border rounded-3xl p-5 text-center cursor-pointer ${dragging ? "border-primary bg-light" : "border-secondary"}`}
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
          </div>
          <button
            className="bg-white text-black font-medium text-sm px-4 py-1.5 rounded-full hover:bg-neutral-200 transition-colors active:scale-95 disabled:opacity-50 max-w-[150px] m-auto"
            disabled={!file}
            onClick={transform}
          >
            {"Trasforma"}
          </button>
          {errorMessage && (
            <div className="text-red-500 text-sm mt-2 text-center">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </>
  );
}
