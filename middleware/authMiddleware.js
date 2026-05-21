import jwt from "jsonwebtoken";

const authMiddleware = async (
  req,
  res,
  next
) => {

  try {

    const token = req.cookies.token;

    // CHECK TOKEN

    if (!token) {

      return res.redirect("/login");

    }

    // VERIFY TOKEN

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {

    return res.redirect("/login");

  }
};

export default authMiddleware;