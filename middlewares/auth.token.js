import jwt from "jsonwebtoken";

const generateToken = async (data, secret, expires) => {
    const newToken = await jwt.sign({userId:data}, secret, {
        expiresIn: expires
    });
    return newToken
}

const verifyToken = async (token, secret) => {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded
    } catch (err) {
        throw new Error("Invalid Token");
    }
}



export { generateToken,verifyToken }