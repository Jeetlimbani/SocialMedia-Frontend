import { Paper, Box, Typography } from '@mui/material';

const AuthFormContainer = ({ title, subtitle, icon, children }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 450,
        width: '100%',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',  // Centers content inside the container
        textAlign: 'center',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {icon}
        <Typography variant="h4" fontWeight="bold">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      </Box>
      {children}
    </Paper>
  );
};

export default AuthFormContainer;
