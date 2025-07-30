import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import axios, { AxiosError } from 'axios';
import { Bell, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

interface CreditorsData {
    _id: string;
    customerName: string;
    totalOutstanding: number;
    phone: string
}

const TopCreditors = () => {
    const [creditors, setCreditors] = useState<CreditorsData[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
const [isSendingId, setIsSendingId] = useState<string | null>(null);
    useEffect(() => {
        const fetchCreditors = async () => {
            try {
            const res = await axios.get("/api/dashboard/top-creditors");
            if(res.data && res.data.topCreditors){
                setCreditors(res.data.topCreditors)
            }
            } catch (error) {
                const axiosError = error as AxiosError
                console.log("Error fetching creditors data: ", axiosError)
            }finally{
                setLoading(false)
            }
        }
        fetchCreditors()
        
    }, [])

    const sendReminder = async (id: string, name: string, phone: string, amount: number) => {
  if (!name || !phone || !amount) return;
  setIsSendingId(id);
  try {
    const res = await axios.get(`/api/send-credit-reminder?name=${name}&phone=${phone}&amount=${amount}`);
    if (res.data && res.data.success) {
      toast.success(`Credit reminder to ${name} sent successfully`, {
        icon: "✅"
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    console.log("Error sending reminder: ", axiosError);
  } finally {
    setIsSendingId(null);
  }
};


  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
  {/* Header */}
  <div className="sm:text-2xl text-xl font-bold text-gray-800 mb-6">
    Due Customers
  </div>

  {/* Table */}
  {loading ? (
    <Loader2 className="animate-spin mx-auto" />
  ) : creditors && creditors.length === 0 ? (
    <div className="text-center text-gray-500">No Customers Found</div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto text-sm rounded-xl">
        <thead className="bg-gray-100 text-left text-gray-700">
          <tr>
            <th className='px-4 py-2'>#</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Due Amount</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {creditors?.map((creditor, index) => (
            <tr key={creditor._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-muted-foreground">{index+1}</td>
              <td className="px-4 py-3 font-medium">{creditor.customerName}</td>
              <td className="px-4 py-3 text-muted-foreground">{creditor.phone}</td>
              <td className="px-4 py-3 font-semibold text-red-600">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(creditor.totalOutstanding || 0)}
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="outline"
                  disabled={isSendingId === creditor._id}
                  className="text-sm bg-amber-500 hover:bg-amber-600 text-white hover:text-white h-8 px-3"
                  onClick={() =>
                    sendReminder(
                      creditor._id,
                      creditor.customerName,
                      creditor.phone,
                      creditor.totalOutstanding
                    )
                  }
                >
                  {isSendingId === creditor._id ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <span className="flex items-center gap-1">
                      <Bell className="w-4 h-4" />
                      Send Reminder
                    </span>
                  )}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

  )
}

export default TopCreditors