export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.id_roles;
    console.log('User Role:', userRole, 'Allowed Roles:', allowedRoles); 
    
    if (allowedRoles.includes(userRole)) {
      return next(); 
    } else {
      return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
    }
  };
}
  