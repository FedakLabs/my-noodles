'use client';

import { MuiTelInput, type MuiTelInputProps } from 'mui-tel-input';

import { formatPhoneToE164 } from './phone-format';

export type PhoneInputProps = Omit<MuiTelInputProps, 'onChange' | 'value' | 'forceCallingCode'> & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function PhoneInput({
  value,
  onChange,
  onBlur,
  defaultCountry = 'UA',
  variant = 'outlined',
  focusOnSelectCountry = true,
  ...rest
}: PhoneInputProps) {
  return (
    <MuiTelInput
      {...rest}
      value={value}
      defaultCountry={defaultCountry}
      variant={variant}
      forceCallingCode
      focusOnSelectCountry={focusOnSelectCountry}
      onChange={(nextValue) => {
        onChange(formatPhoneToE164(nextValue));
      }}
      onBlur={onBlur}
    />
  );
}
