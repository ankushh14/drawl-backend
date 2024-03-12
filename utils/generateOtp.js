import Randomstring from "randomstring";

const generateOtp = ()=>{
    const otp = Randomstring.generate({
        length : 6,
        charset : "numeric"
    })
    return otp
}

export {generateOtp}