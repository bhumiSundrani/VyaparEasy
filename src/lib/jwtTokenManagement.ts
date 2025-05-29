import jwt from 'jsonwebtoken'

const tokenSecret = process.env.JWT_SECRET as string

export interface JWTToken{
    phone: string,
    name: string,
    shopName: string,
    preferredLanguage: string
}

export function generateToken(data: JWTToken | null){
    if(!data){
        console.log("Data not found")
        return null
    }
    const token = jwt.sign(data, tokenSecret, {expiresIn: "7d"})
    return token
}

export function verifyToken(token: string | null){
    if(!token){
        console.log("No token found")
        return null
    }
    try {
        const payload = jwt.verify(token, tokenSecret) as JWTToken
        return payload
    } catch (error) {
        console.error("Token verification failed:", error)
        return null
    }
}