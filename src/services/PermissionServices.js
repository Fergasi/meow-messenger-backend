const verifyUserLoggedIn = (req, res) => {
  if (!req.user) {
    res.status(401).send("User is not logged in");
    throw new Error("User is not logged in");
  }
};

const VerifyUserIsAdmin = (req, res) => {
  verifyUserLoggedIn(req, res);

  if (!req.user.isAdmin) {
    res.status(403).send("Only Admins ave access to this");
    throw new Error("Only Admins ave access to this");
  }
};

const permissionServices = { verifyUserLoggedIn, VerifyUserIsAdmin };

module.exports = permissionServices;
