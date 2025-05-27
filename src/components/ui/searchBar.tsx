import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // trigger filtering immediately on typing
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex gap-2 flex-1">
      <input
        type="text"
        placeholder="Search recipes or say 'search for pasta'"
        value={query}
        onChange={handleChange}
        className="border rounded px-3 py-2 flex-grow"
      />
    </form>
  );
}
