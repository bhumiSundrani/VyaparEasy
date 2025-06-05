import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import PurchaseForm from "@/components/AddEditPurchase";
import { PurchaseFormData } from "@/components/AddEditPurchase";

type PageProps = {
  params: Promise<{ id: string }>,
}

const fetchPurchase = async (id: string): Promise<PurchaseFormData | null> => {
  try {
    // Get cookies from server component
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      console.log("No token found in cookies");
      return null;
    }

    // Make API call with proper headers
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/purchases/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Pass token in Authorization header
        'Cookie': cookieStore.toString(), // Forward all cookies
      },
      cache: 'no-store', // Disable caching for dynamic data
    });
    
    if (!res.ok) {
      console.error("API error:", {
        status: res.status,
        statusText: res.statusText,
        url: res.url
      });
      
      // If it's a 404 or 401, return null to trigger notFound()
      if (res.status === 404 || res.status === 401) {
        return null;
      }
      
      return null;
    }

    const data = await res.json();
    
    // Check if the response indicates success
    if (data.success) {
      return data.purchase;
    } else {
      console.error("API returned error:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  let purchase: PurchaseFormData | null = null;

  if (id !== "new") {
    purchase = await fetchPurchase(id);
    if (!purchase) return notFound(); // show 404 if purchase doesn't exist
  }

  return <PurchaseForm purchase={purchase} />; // Pass the purchase data as a prop
}