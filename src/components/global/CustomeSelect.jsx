import { useState, useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
export default function CustomSelect({
  options,
  value,
  onChange,
  disabled,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-sm font-semibold text-black mb-1 block">
        Topic / Category
      </label>

      <div
        className={`w-full border rounded-xl px-4 py-3 text-sm cursor-pointer ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        onClick={() => !disabled && setOpen(!open)}
      >
        {value || "Select or search..."}
      </div>

      {open && !disabled && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-xl max-h-60 overflow-auto shadow-lg">
          <div className="relative px-2 " >
            <CiSearch className="absolute text-gray-400 mt-3"/>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-2 border-b border-gray-200 focus:outline-none"
            />
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-400">No options found</div>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
