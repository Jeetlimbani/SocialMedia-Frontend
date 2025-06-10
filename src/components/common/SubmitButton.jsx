import { Button, CircularProgress } from '@mui/material';

const SubmitButton = ({ isLoading,onClick,label }) => (
  <Button
    type="submit"
    fullWidth
    variant="contained"
    size="large"
    disabled={isLoading}
    onClick={onClick}
    sx={{ py: 1.5, mt: 2, position: 'relative' }}
  >
    {isLoading ? <CircularProgress size={24} color="inherit" /> : label}
  </Button>
);

export default SubmitButton;
