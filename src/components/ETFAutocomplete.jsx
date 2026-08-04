import { useState, useEffect, useRef } from "react";

export default function ETFAutocomplete({
  items = [],
  valueFrom,
  onChange,
  placeholder = "Cerca...",
  autoFocus = false,
}) {
  const wrapperRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(valueFrom);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setValue(valueFrom);
  }, [valueFrom]);

  useEffect(() => {
    onChange?.(selectedItem);
  }, [selectedItem, onChange]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const name = item.name;
    const ticker = item.ticker;
    const valueLower = value?.toLowerCase() || "";
    return name.toLowerCase().includes(valueLower) || ticker.toLowerCase().includes(valueLower);
  });

  return (
    <div ref={wrapperRef} className="sm:col-span-4 relative">
      <input
        autoFocus={autoFocus}
        type="text"
        placeholder={placeholder}
        value={value}
        onFocus={() => {
          if (filteredItems.length > 0) {
            setOpen(true);
          }
        }}
        onChange={(e) => {
          const newValue = e.target.value;

          setValue(newValue);

          setOpen(
            items.some((item) =>
              item.name.toLowerCase().includes(newValue.toLowerCase()) ||
              item.ticker.toLowerCase().includes(newValue.toLowerCase()),
            ),
          );
        }}
        className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-white outline-none placeholder:text-white/20"
      />
      {open && (
        <div className="absolute z-50 w-full bg-[#121212] border border-select-line rounded-lg shadow-xl p-2">
          <div className="max-h-72 rounded-b-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
            {filteredItems.map((item, index) => (
              <div key={index} tabIndex="0">
                <span
                  className="flex items-center cursor-pointer py-2 px-4 w-full text-sm text-select-item-foreground rounded-lg"
                  onMouseDown={(e) => {
                    e.preventDefault();

                    setValue(`${item.ticker} - ${item.name}`);
                    setSelectedItem(item);
                    onChange?.(item);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center w-full">
                    <div>{item.ticker} - {item.name}</div>
                  </div>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
