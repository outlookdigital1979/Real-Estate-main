import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  // console.log(token+" token not find")

  if (!token){
    console.error("Token not found.");
    return res.status(401).json({ message: "Not Authenticated" });
  } 

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) return res.status(403).json({ message: "Token is not valid!" });
    req.userId = payload.id;
    next();
  });
};
