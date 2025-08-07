"use client"
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, Edit, Eye, Package, Calendar, CreditCard, User } from "lucide-react"
import { DeleteButton } from "@/components/DeleteButton";
import axios from "axios";
import { toast } from "sonner";
import React from "react";

export interface PurchaseColumnData {
  _id: string;
  paymentType: 'cash' | 'credit';
  supplier: {
    name: string;
    phone: string;
  };
  items: {
    productId: string
    productName: string
    quantity: number;
    pricePerUnit: number;
  }[];
  totalAmount: number;
  otherExpenses: {
    name: string;
    amount: number;
  }[];
  transactionDate: Date;
  paid: boolean;
}

// Enhanced Mobile Card Component with better styling
const MobilePurchaseCard = ({ purchase, onEdit, onDelete, onView, editDisabled, viewDisabled, paidDisabled, onPaid, paid }: {
  purchase: PurchaseColumnData;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  onView: () => void;
  onPaid: () => void;
  editDisabled: boolean;
  viewDisabled: boolean;
  deleteDisabled: boolean;
  paidDisabled: boolean;
  paid: boolean
}) => {
  const totalItems = purchase.items.length;
  const totalQuantity = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
  const otherExpensesTotal = purchase.otherExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const isPaid = purchase.paymentType === 'cash';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 mb-3 max-w-[320px] ml-auto mr-auto">
      {/* Header Section - Supplier and Payment Info */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-base text-gray-900 leading-tight truncate">
              {purchase.supplier.name}
            </h3>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {purchase.supplier.phone}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {new Date(purchase.transactionDate).toLocaleDateString('en-IN')}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-semibold border flex items-center gap-1 ${
              isPaid
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-orange-50 text-orange-700 border-orange-200"
            }`}
          >
            <CreditCard className="h-3 w-3" />
            {isPaid ? "Paid" : "Credit"}
          </span>
        </div>
      </div>

      {/* Items Summary Section */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Items Summary</span>
          </div>
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full border">
            {totalItems} product{totalItems !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-600 font-medium mb-1">Total Quantity</div>
            <div className="text-sm font-bold text-gray-900">
              {totalQuantity} items
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 font-medium mb-1">Base Amount</div>
            <div className="text-sm font-bold text-gray-900">
              ₹{(purchase.totalAmount - otherExpensesTotal).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        
        {/* Sample Items Display */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600 font-medium mb-2">Items:</div>
          <div className="space-y-1">
            {purchase.items.slice(0, 2).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-gray-700 truncate flex-1">
                  {item.productName}
                </span>
                <span className="text-gray-600 ml-2">
                  {item.quantity}x @ ₹{item.pricePerUnit}
                </span>
              </div>
            ))}
            {purchase.items.length > 2 && (
              <div className="text-xs text-gray-500 italic">
                +{purchase.items.length - 2} more items...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total Amount Section */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-800">Total Purchase Amount</span>
          <span className="text-lg font-bold text-blue-900">
            ₹{purchase.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
        
        {otherExpensesTotal > 0 && (
          <div className="flex justify-between items-center text-xs text-blue-700">
            <span>Other Expenses</span>
            <span>₹{otherExpensesTotal.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="flex gap-1 pt-1 flex-wrap items-center justify-center">
        <Button
          variant="outline"
          size="sm"
          disabled={viewDisabled}
          onClick={onView}
          className="flex-1 h-9 text-sm font-medium border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
        >
          {viewDisabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              View
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          disabled={editDisabled}
          onClick={onEdit}
          className="flex-1 h-9 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          {editDisabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
        
        <DeleteButton onDelete={onDelete} type="purchase entry"/>

        <Button
          variant="outline"
          size="sm"
          onClick={onPaid}
          disabled={paidDisabled}
          className={`h-9 text-sm font-medium outline-0 border-0 transition-colors text-white ${!paid ? "bg-green-500 hover:bg-green-600": "bg-amber-500 hover:bg-amber-600"}`}
        >
          {
            paidDisabled ? (
               <Loader2 className="h-4 w-4 animate-spin" />
            ) : paid ? ("Mark as unpaid") : ("Mark as paid")
          }
          
        </Button>
      </div>
    </div>
  );
};

interface MobileCardCellProps {
  purchase: PurchaseColumnData;
  handlePurchaseDeleted: () => void;  
  setPurchase: React.Dispatch<React.SetStateAction<PurchaseColumnData[]>>
}

const MobileCardCell: React.FC<MobileCardCellProps> = ({ purchase, handlePurchaseDeleted, setPurchase }) => {
  const router = useRouter();
  const [editDisabled, setEditDisabled] = React.useState(false);
  const [viewDisabled, setViewDisabled] = React.useState(false);
  const [deleteDisabled, setDeleteDisabled] = React.useState(false);
  const [paidDisabled, setPaidDisabled] = React.useState(false)
  const [isPaid, setIsPaid] = React.useState(purchase.paid)

  const handleEdit = () => {
    setEditDisabled(true);
    router.push(`/purchases/edit-purchase/${purchase._id}`);
  };

  const handleView = () => {
    setViewDisabled(true);
    router.push(`/purchases/${purchase._id}`);
  };

  const handleDelete = async () => {
    try {
      setDeleteDisabled(true);
      await axios.delete(`/api/purchases/delete-purchase/${purchase._id}`);
      toast.success("Purchase deleted successfully", {
        icon: "✅",
      });
      handlePurchaseDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Error deleting purchase", {
        icon: "❌",
      });
    } finally {
      setDeleteDisabled(false);
    }
  };

  const handlePaid = async () => {
    try {
      setPaidDisabled(true);
      const res = await axios.put(`/api/purchases/${purchase._id}`);
       if (res.data?.purchase?.paid !== undefined) {
  setPurchase((prev) =>
    prev.map((p) =>
      p._id === purchase._id ? { ...p, paid: res.data.purchase.paid } : p
    )
  );
  setIsPaid(res.data.purchase.paid);
}
 else {
      setIsPaid(prev => !prev); // fallback
    }  
    toast.success("Purchase updated successfully", {
          icon: "✅",
        });
    } catch (error) {
      console.log(error);
      toast.error("Error updating purchase", {
        icon: "❌",
      });
    } finally {
      setPaidDisabled(false);
    }
  }

  return (
    <div className="md:hidden w-full md:-mx-4">
      <MobilePurchaseCard
        purchase={purchase}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        editDisabled={editDisabled}
        viewDisabled={viewDisabled}
        deleteDisabled={deleteDisabled}
        onPaid={handlePaid}
        paidDisabled={paidDisabled}
        paid={isPaid}
      />
    </div>
  );
};

interface DesktopActionsCellProps {
  purchase: PurchaseColumnData;
  handlePurchaseDeleted: () => void;
  setPurchase: React.Dispatch<React.SetStateAction<PurchaseColumnData[]>>
}

const DesktopActionsCell: React.FC<DesktopActionsCellProps> = ({ purchase, handlePurchaseDeleted, setPurchase }) => {
  const router = useRouter();
  const [editDisabled, setEditDisabled] = React.useState(false);
  const [viewDisabled, setViewDisabled] = React.useState(false);
  const [paidDisabled, setPaidDisabled] = React.useState(false)
  const [isPaid, setIsPaid] = React.useState(purchase.paid)

  const handleDeletePurchase = async () => {
    try {
      await axios.delete(`/api/purchases/delete-purchase/${purchase._id}`);
      toast.success("Purchase deleted successfully", {
        icon: "✅",
      });
      handlePurchaseDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Error deleting purchase", {
        icon: "❌",
      });
    }
  };

  const handlePaid = async () => {
    try {
      setPaidDisabled(true);
      const res = await axios.put(`/api/purchases/${purchase._id}`);
         
      if (res.data?.purchase?.paid !== undefined) {
  setPurchase((prev) =>
    prev.map((p) =>
      p._id === purchase._id ? { ...p, paid: res.data.purchase.paid } : p
    )
  );
  setIsPaid(res.data.purchase.paid);
}
 else {
      setIsPaid(prev => !prev); // fallback
    }  
    toast.success("Purchase updated successfully", {
          icon: "✅",
        });
    } catch (error) {
      console.log(error);
      toast.error("Error updating purchase", {
        icon: "❌",
      });
    } finally {
      setPaidDisabled(false);
    }
  }

  return (
    <div className="hidden md:flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={viewDisabled}
        onClick={() => {
          setViewDisabled(true);
          router.push(`/purchases/${purchase._id}`);
        }}
        className="h-9 px-3 text-sm font-medium border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
      >
        {viewDisabled ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <>
            <Eye className="h-3 w-3 mr-1.5" />
            View
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={editDisabled}
        onClick={() => {
          setEditDisabled(true);
          router.push(`/purchases/edit-purchase/${purchase._id}`);
        }}
        className="h-9 px-3 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        {editDisabled ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <>
            <Edit className="h-3 w-3 mr-1.5" />
            Edit
          </>
        )}
      </Button>

      <DeleteButton onDelete={handleDeletePurchase} type="purchase entry"/>

      <Button
          variant="outline"
          size="sm"
          onClick={handlePaid}
          disabled={paidDisabled}
          className={` h-9 text-sm font-medium outline-none border-none transition-colors text-white hover:text-white ${!isPaid ? "bg-green-500 hover:bg-green-600": "bg-amber-500 hover:bg-amber-600"}`}
        >
          {
            paidDisabled ? (
               <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPaid ? ("Mark as unpaid") : ("Mark as paid")
          }
          
        </Button>
    </div>
  );
};

// Convert purchaseColumns to a function that accepts handlePurchaseDeleted callback
export const PurchaseColumns = (handlePurchaseDeleted: () => void, setPurchase: React.Dispatch<React.SetStateAction<PurchaseColumnData[]>>,): ColumnDef<PurchaseColumnData>[] => [
  // Mobile-first: Single column that renders cards on mobile, hidden on desktop
  {
    id: "mobile-card",
    header: () => null,
    cell: ({ row }) => {
      const purchase = row.original;
      return <MobileCardCell purchase={purchase} handlePurchaseDeleted={handlePurchaseDeleted} setPurchase={setPurchase}/>;
    },
    enableSorting: false,
  },
  // Desktop columns - enhanced styling
  {
    id: "serial",
    header: () => <span className="hidden md:block font-semibold text-gray-700">#</span>,
    cell: ({ row }) => (
      <span className="hidden md:flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-500 bg-gray-100 rounded-full">
        {row.index + 1}
      </span>
    ),
    enableSorting: false,
    size: 60,
  },
  
  {
    accessorKey: "supplier",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Supplier Details</span>,
    size: 220,
    cell: ({ getValue }) => {
      const supplier = getValue() as PurchaseColumnData['supplier'];
      return (
        <div className="hidden md:block space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <div className="font-semibold text-gray-900 text-sm leading-tight max-w-[180px] truncate">
              {supplier.name}
            </div>
          </div>
          <div className="text-xs text-gray-600 ml-6">
            {supplier.phone}
          </div>
        </div>
      );
    },
  },
  
  {
    accessorKey: "transactionDate",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Date</span>,
    size: 120,
    cell: ({ getValue }) => {
      const date = new Date(getValue() as Date);
      return (
        <div className="hidden md:block space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {date.toLocaleDateString('en-IN')}
            </span>
          </div>
          <div className="text-xs text-gray-500 ml-6">
            {date.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      );
    },
  },
  
  {
    accessorKey: "items",
    header: () => <span className="hidden lg:block font-semibold text-gray-700">Items Summary</span>,
    size: 200,
    cell: ({ getValue }) => {
      const items = getValue() as PurchaseColumnData['items'];
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      
      return (
        <div className="hidden lg:block space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {items.length} product{items.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-xs text-gray-600 ml-6">
            Total Qty: {totalQuantity} items
          </div>
          <div className="text-xs text-gray-500 ml-6 max-w-[180px] truncate">
            {items[0]?.productName}
            {items.length > 1 && ` +${items.length - 1} more`}
          </div>
        </div>
      );
    },
  },
  
  {
    accessorKey: "paymentType",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Payment</span>,
    size: 100,
    cell: ({ getValue }) => {
      const paymentType = getValue() as string;
      const isPaid = paymentType === 'cash';
      
      return (
        <div className="hidden md:block">
          <span
            className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-semibold border whitespace-nowrap ${
              isPaid
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-orange-50 text-orange-700 border-orange-200"
            }`}
          >
            <CreditCard className="h-3 w-3 mr-1" />
            {isPaid ? "Cash" : "Credit"}
          </span>
        </div>
      );
    },
  },
  
  {
    accessorKey: "totalAmount",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Total Amount</span>,
    size: 140,
    cell: ({ getValue, row }) => {
      const totalAmount = getValue() as number;
      const purchase = row.original;
      const otherExpensesTotal = purchase.otherExpenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const baseAmount = totalAmount - otherExpensesTotal;
      
      return (
        <div className="hidden md:block space-y-1">
          <div className="font-bold text-blue-600 text-base">
            ₹{totalAmount.toLocaleString('en-IN')}
          </div>
          {otherExpensesTotal > 0 && (
            <div className="text-xs text-gray-500">
              Base: <span className="text-gray-700">₹{baseAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
          {otherExpensesTotal > 0 && (
            <div className="text-xs text-gray-500">
              Extra: <span className="text-orange-600">₹{otherExpensesTotal.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      );
    },
  },
  
  {
    id: "actions",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Actions</span>,
    size: 180,
    cell: ({ row }) => {
      const purchase = row.original;
      return <DesktopActionsCell purchase={purchase} handlePurchaseDeleted={handlePurchaseDeleted} setPurchase={setPurchase}/>;
    },
    enableSorting: false,
  },
];