import bcrypt from "bcryptjs";

const generateSalt = async()=>{
    const salt =  await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
    return salt
}

const generatePassword = async(password)=>{
    const salt = await generateSalt();
    const newPassword = await bcrypt.hash(password,salt);
    return newPassword;
}

const validatePassword = async(password,hashPassword)=>{
    return await bcrypt.compare(password,hashPassword);
}

export {generateSalt,generatePassword,validatePassword}