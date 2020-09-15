import React from 'react';

export function StringEditor(props: { value: string, onChange?: (newValue: string) => void, disabled?: boolean, placeholder?: string }) {
  const { value, onChange, disabled, placeholder } = props;

  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange ? onChange(e.target.value) : null}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}