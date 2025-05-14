import React from "react";

type TextInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
};

const TextInput: React.FC<TextInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  label,
}) => {
  return (
    <div style={{ marginBottom: "1rem", marginTop: "2rem" }}>
      {label && <label htmlFor={id}>{label}</label>}
      <br />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        pattern="-?\d*"
      />
    </div>
  );
};

export default TextInput;
