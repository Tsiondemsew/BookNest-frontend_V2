// export const getRoleRedirectPath = (role: string): string => {
//   switch (role) {
//     case 'author':
//       return '/studio';
//     case 'publisher':
//       return '/studio';  // Publishers also go to studio dashboard
//     case 'admin':
//       return '/admin/dashboard';  // Will redirect to admin.booknest.com later
//     case 'reader':
//     default:
//       return '/';
//   }
// };

// export const getRoleBasedHomePath = (role: string): string => {
//   switch (role) {
//     case 'author':
//     case 'publisher':
//       return '/studio';
//     case 'reader':
//     default:
//       return '/';
//   }
// };