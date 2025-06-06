import dbConnect from "@/lib/dbConnect";
import PartyModel from "@/models/Party.model";
import UserModel from "@/models/User.model";
import { verifyToken } from "@/lib/jwtTokenManagement";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  const {type} = await req.json()
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
    }

    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // Find user
    const user = await UserModel.findOne({ phone: decodedToken.phone });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    // Optional: get search param for filtering by name or phone
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";

    // Build query
    const query: any = { user: user._id, type: type};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },   // case-insensitive match on name
        { phone: { $regex: search, $options: "i" } },  // or phone match
      ];
    }

    // Fetch parties matching criteria
    const parties = await PartyModel.find(query)
      .select("name phone")   // select only fields needed for suggestions
      .limit(10)              // limit results for performance
      .lean();

    return NextResponse.json({ success: true, parties }, { status: 200 });
  } catch (error) {
    console.error("Error fetching parties:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch parties" }, { status: 500 });
  }
}
