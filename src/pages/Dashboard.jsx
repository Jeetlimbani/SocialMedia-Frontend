// import React from 'react';
// import { useSelector } from 'react-redux';

// function Dashboard() {
//   const { user } = useSelector((state) => state.auth);

//   if (!user) {
//     return (
//       <div style={{ padding: '20px' }}>
//         <h2>Access Denied</h2>
//         <p>Please log in to view the dashboard.</p>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Welcome to your Dashboard, {user.username}!</h2>
//       <p>This is a protected page. Only logged-in users can see this.</p>
//       <p>Your Email: {user.email}</p>
//       {/* You can display more user-specific information here */}
//     </div>
//   );
// }

// export default Dashboard;

// import React from 'react';
// import { useSelector } from 'react-redux';
// import {
//   Box,
//   Container,
//   Paper,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Avatar,
//   Chip,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   Button,
//   Stack,
// } from '@mui/material';
// import {
//   Person,
//   Email,
//   AccountCircle,
//   CalendarToday,
//   Settings,
//   Notifications,
//   Security,
//   Help,
//   TrendingUp,
//   People,
//   Chat,
// } from '@mui/icons-material';

// function Dashboard() {
//   const { user } = useSelector((state) => state.auth);

//   if (!user) {
//     return (
//       <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
//         <Paper sx={{ p: 4 }}>
//           <Typography variant="h4" color="error" gutterBottom>
//             Access Denied
//           </Typography>
//           <Typography variant="body1">
//             Please log in to view the dashboard.
//           </Typography>
//         </Paper>
//       </Container>
//     );
//   }

//   const stats = [
//     { label: 'Posts', value: '24', icon: <TrendingUp /> },
//     { label: 'Friends', value: '156', icon: <People /> },
//     { label: 'Messages', value: '89', icon: <Chat /> },
//   ];

//   const recentActivities = [
//     'Welcome to your new account!',
//     'Profile setup completed',
//     'Email verification successful',
//     'Account security enabled',
//   ];

//   const quickActions = [
//     { label: 'Edit Profile', icon: <Person />, color: 'primary' },
//     { label: 'Settings', icon: <Settings />, color: 'secondary' },
//     { label: 'Notifications', icon: <Notifications />, color: 'warning' },
//     { label: 'Help & Support', icon: <Help />, color: 'info' },
//   ];

//   return (
//     <Container maxWidth="lg">
//       {/* Welcome Section */}
//       <Paper
//         sx={{
//           p: 4,
//           mb: 4,
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           color: 'white',
//           borderRadius: 2,
//         }}
//       >
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//           <Avatar
//             sx={{
//               width: 80,
//               height: 80,
//               bgcolor: 'rgba(255, 255, 255, 0.2)',
//               fontSize: '2rem',
//               mr: 3,
//             }}
//           >
//             {user.username?.charAt(0).toUpperCase()}
//           </Avatar>
//           <Box>
//             <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
//               Welcome back, {user.username}! 👋
//             </Typography>
//             <Typography variant="h6" sx={{ opacity: 0.9 }}>
//               Here's what's happening with your account today
//             </Typography>
//           </Box>
//         </Box>
//         <Chip
//           label="Account Active"
//           color="success"
//           variant="filled"
//           sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
//         />
//       </Paper>

//       <Grid container spacing={4}>
//         {/* User Information */}
//         <Grid item xs={12} md={4}>
//           <Paper sx={{ p: 3, height: 'fit-content' }}>
//             <Typography variant="h6" gutterBottom fontWeight="bold">
//               Profile Information
//             </Typography>
//             <List>
//               <ListItem>
//                 <ListItemIcon>
//                   <Person color="primary" />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Username"
//                   secondary={user.username}
//                 />
//               </ListItem>
//               <ListItem>
//                 <ListItemIcon>
//                   <Email color="primary" />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Email"
//                   secondary={user.email}
//                 />
//               </ListItem>
//               <ListItem>
//                 <ListItemIcon>
//                   <CalendarToday color="primary" />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Member Since"
//                   secondary={new Date().toLocaleDateString()}
//                 />
//               </ListItem>
//               <ListItem>
//                 <ListItemIcon>
//                   <Security color="primary" />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Account Status"
//                   secondary={
//                     <Chip
//                       label="Verified"
//                       color="success"
//                       size="small"
//                     />
//                   }
//                 />
//               </ListItem>
//             </List>
//           </Paper>
//         </Grid>

//         {/* Stats and Quick Actions */}
//         <Grid item xs={12} md={8}>
//           {/* Stats Cards */}
//           <Grid container spacing={3} sx={{ mb: 3 }}>
//             {stats.map((stat, index) => (
//               <Grid item xs={12} sm={4} key={index}>
//                 <Card
//                   sx={{
//                     textAlign: 'center',
//                     transition: 'transform 0.2s',
//                     '&:hover': {
//                       transform: 'translateY(-4px)',
//                     },
//                   }}
//                 >
//                   <CardContent>
//                     <Box sx={{ color: 'primary.main', mb: 1 }}>
//                       {stat.icon}
//                     </Box>
//                     <Typography variant="h4" component="div" fontWeight="bold">
//                       {stat.value}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {stat.label}
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>

//           {/* Quick Actions */}
//           <Paper sx={{ p: 3, mb: 3 }}>
//             <Typography variant="h6" gutterBottom fontWeight="bold">
//               Quick Actions
//             </Typography>
//             <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
//               {quickActions.map((action, index) => (
//                 <Button
//                   key={index}
//                   variant="outlined"
//                   startIcon={action.icon}
//                   color={action.color}
//                   sx={{ mb: 1 }}
//                 >
//                   {action.label}
//                 </Button>
//               ))}
//             </Stack>
//           </Paper>

//           {/* Recent Activity */}
//           <Paper sx={{ p: 3 }}>
//             <Typography variant="h6" gutterBottom fontWeight="bold">
//               Recent Activity
//             </Typography>
//             <List>
//               {recentActivities.map((activity, index) => (
//                 <React.Fragment key={index}>
//                   <ListItem>
//                     <ListItemIcon>
//                       <AccountCircle color="action" />
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={activity}
//                       secondary={`${index + 1} day${index !== 0 ? 's' : ''} ago`}
//                     />
//                   </ListItem>
//                   {index < recentActivities.length - 1 && <Divider />}
//                 </React.Fragment>
//               ))}
//             </List>
//           </Paper>
//         </Grid>
//       </Grid>

//       {/* Additional Features Section */}
//       <Paper sx={{ p: 4, mt: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
//         <Typography variant="h5" gutterBottom fontWeight="bold">
//           Explore More Features
//         </Typography>
//         <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//           Discover all the amazing features our platform has to offer
//         </Typography>
//         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
//           <Button variant="contained" size="large">
//             Explore Features
//           </Button>
//           <Button variant="outlined" size="large">
//             View Tutorial
//           </Button>
//         </Stack>
//       </Paper>
//     </Container>
//   );
// }

// export default Dashboard;