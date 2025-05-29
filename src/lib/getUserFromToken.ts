import { cookies } from 'next/headers';
import { verifyToken } from './jwtTokenManagement';
import UserModel from '@/models/User.model';
import dbConnect from './dbConnect';

export async function getUserFromToken() {
    try {
        const cookieStore = cookies();
        const token = (await cookieStore).get('token')?.value;
        
        if (!token) {
            return null;
        }

        const decodedToken = verifyToken(token);
        if (!decodedToken) {
            return null;
        }

        await dbConnect();
        const user = await UserModel.findOne({ phone: decodedToken.phone });
        
        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error("Error getting user from token:", error);
        return null;
    }
} 