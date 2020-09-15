import React from 'react';

export function BooleanEditor(props: { value: boolean, onChange?: (newValue: boolean) => void, disabled?: boolean }) {
  const { value, onChange, disabled } = props;

  return <input type="checkbox" checked={value} onChange={e => onChange ? onChange(e.target.checked) : null} disabled={disabled} />;
}