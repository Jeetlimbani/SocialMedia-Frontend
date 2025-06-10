import { TextField, InputAdornment } from '@mui/material';

const InputField = ({ name, label, value, onChange, icon, error }) => {
  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      fullWidth
      variant="outlined"
      InputProps={{
        startAdornment: icon && (
          <InputAdornment position="start">
            {icon}
          </InputAdornment>
        ),
      }}
      error={error}
    />
  );
};

export default InputField;

