export interface JWTToken {
    phone: string;
    name: string;
    shopName: string;
    preferredLanguage: string;
    iat?: number;
    exp?: number;
} 