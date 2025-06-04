"use client"
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, Edit} from "lucide-react"
import { DeleteButton } from "@/components/DeleteButton";
import axios from "axios";
import { toast } from "sonner";
import React from "react";


export interface ProductColumnData {
  _id: string
  name: string;
  brand: string;
  category: {
    _id: string;
    name: string
  };
  unit: "kg" | "gm" | "liter" | "ml" | "pcs";
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
  currentStock: number;  
  imageUrl: string;
}


// Enhanced Mobile Card Component with better styling
const MobileProductCard = ({ product, onEdit, onDelete, editDisabled}: {
  product: ProductColumnData;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  editDisabled: boolean;
  deleteDisabled: boolean;
}) => {
  const inStock = product.currentStock > 0;
  const isLowStock = product.currentStock <= product.lowStockThreshold && product.currentStock > 0;

  return (
    <div className=" bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 mb-3 max-w-[320px] ml-auto mr-auto">
      {/* Header Section - Image and Basic Info */}
      <div className="flex items-start gap-3">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 shadow-sm">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="object-cover w-full h-full transition-transform hover:scale-105" 
            onError={(e) => {
              e.currentTarget.src = '/product-icon-png-19.jpg';
            }}
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-gray-900 leading-tight mb-1 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600 font-medium">{product.brand}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{product.category?.name || "Uncategorized"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Selling Price</span>
              <span className="font-bold text-lg text-green-600">
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                !inStock
                  ? "bg-red-50 text-red-700 border-red-200"
                  : isLowStock
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {!inStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
            </span>
          </div>
        </div>
      </div>

      {/* Details Section - Stock and Pricing Info */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-600 font-medium mb-1">Current Stock</div>
            <div className="text-sm font-bold text-gray-900">
              {product.currentStock} <span className="text-xs font-normal text-gray-600">{product.unit}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 font-medium mb-1">Cost Price</div>
            <div className="text-sm font-bold text-gray-900">
              ₹{product.costPrice.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        
        {/* Additional Info Row */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xs text-gray-600 font-medium">Low Stock Alert</div>
            <div className="text-xs text-gray-700 font-semibold">{product.lowStockThreshold} {product.unit}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 font-medium">Profit Margin</div>
            <div className="text-xs text-green-600 font-semibold">
              ₹{(product.sellingPrice - product.costPrice).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex gap-2.5 pt-1">
        <Button
          variant="outline"
          size="sm"
          disabled={editDisabled}
          onClick={onEdit}
          className="flex-1 h-10 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          {editDisabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </>
          )}
        </Button>
        
        <DeleteButton onDelete={onDelete} type="product"/>
      </div>
    </div>
  );
};

interface MobileCardCellProps {
  product: ProductColumnData;
  handleProductDeleted: () => void;
}

const MobileCardCell: React.FC<MobileCardCellProps> = ({ product, handleProductDeleted }) => {
  const router = useRouter();
  const [editDisabled, setEditDisabled] = React.useState(false);
  const [deleteDisabled, setDeleteDisabled] = React.useState(false);

  const handleEdit = () => {
    setEditDisabled(true);
    router.push(`/all-products/${product._id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setDeleteDisabled(true);
      await axios.delete(`/api/products/${product._id}`);
      toast.success("Product deleted successfully", {
        icon: "✅",
      });
      handleProductDeleted();
    } catch (error) {
      console.log(error)
      toast.error("Error deleting product", {
        icon: "❌",
      });
    } finally {
      setDeleteDisabled(false);
    }
  };

  return (
    <div className="md:hidden w-full md:-mx-4">
      <MobileProductCard
        product={product}
        onEdit={handleEdit}
        onDelete={handleDelete}
        editDisabled={editDisabled}
        deleteDisabled={deleteDisabled}
      />
    </div>
  );
};


interface DesktopActionsCellProps {
  product: ProductColumnData;
  handleProductDeleted: () => void;
}

const DesktopActionsCell: React.FC<DesktopActionsCellProps> = ({ product, handleProductDeleted }) => {
  const router = useRouter();
  const [editDisabled, setEditDisabled] = React.useState(false);

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(`/api/products/${product._id}`);
      toast.success("Product deleted successfully", {
        icon: "✅",
      });
      handleProductDeleted();
    } catch (error) {
      console.log(error)
      toast.error("Error deleting product", {
        icon: "❌",
      });
    }
  };

  return (
    <div className="hidden md:flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={editDisabled}
        onClick={() => {
          setEditDisabled(true);
          router.push(`/all-products/${product._id}/edit`);
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

      <DeleteButton onDelete={handleDeleteProduct} type="product"/>
    </div>
  );
};


// Convert productColumns to a function that accepts handleProductDeleted callback
export const ProductColumns = (handleProductDeleted: () => void): ColumnDef<ProductColumnData>[] => [
  // Mobile-first: Single column that renders cards on mobile, hidden on desktop
  {
    id: "mobile-card",
    header: () => null,
    cell: ({ row }) => {
      const product = row.original;
      return <MobileCardCell product={product} handleProductDeleted={handleProductDeleted} />;
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
    accessorKey: "imageUrl",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Image</span>,
    cell: ({ getValue }) => {
      const url = getValue() as string;
      return (
        <div className="hidden md:block">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <img 
              src={url} 
              alt="Product" 
              className="object-cover w-full h-full hover:scale-105 transition-transform" 
              onError={(e) => {
                e.currentTarget.src = '/product-icon-png-19.jpg';
              }}
              loading="lazy"
            />
          </div>
        </div>
      );
    },
    size: 90,
    enableSorting: false,
  },
  
  {
    accessorKey: "name",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Product Details</span>,
    size: 250,
    cell: ({ getValue, row }) => {
      const product = row.original;
      return (
        <div className="hidden md:block space-y-1">
          <div className="font-semibold text-gray-900 text-base leading-tight max-w-[220px] truncate">
            {getValue() as string}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 font-medium">{product.brand}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{product.category?.name || "Uncategorized"}</span>
          </div>
        </div>
      );
    },
  },
  
  {
    accessorKey: "costPrice",
    header: () => <span className="hidden lg:block font-semibold text-gray-700">Cost Price</span>,
    size: 120,
    cell: ({ getValue }) => (
      <div className="hidden lg:block">
        <span className="text-sm font-semibold text-gray-700">
          ₹{(getValue() as number).toLocaleString('en-IN')}
        </span>
      </div>
    ),
  },
  
  {
    accessorKey: "sellingPrice",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Selling Price</span>,
    size: 130,
    cell: ({ getValue, row }) => {
      const sellingPrice = getValue() as number;
      const product = row.original;
      const profit = sellingPrice - product.costPrice;
      return (
        <div className="hidden md:block space-y-1">
          <div className="font-bold text-green-600 text-base">
            ₹{sellingPrice.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500">
            Profit: <span className="text-green-600 font-medium">₹{profit.toLocaleString('en-IN')}</span>
          </div>
        </div>
      );
    },
  },
  
  {
    accessorKey: "currentStock",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Stock Status</span>,
    size: 140,
    cell: ({ getValue, row }) => {
      const currentStock = Number(getValue());
      const product = row.original;
      const inStock = currentStock > 0;
      const isLowStock = currentStock <= product.lowStockThreshold && currentStock > 0;
      
      return (
        <div className="hidden md:block space-y-2">
          <span
            className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-semibold border whitespace-nowrap ${
              !inStock
                ? "bg-red-50 text-red-700 border-red-200"
                : isLowStock
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {!inStock ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Out of Stock
              </>
            ) : isLowStock ? (
              <>
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                Low Stock
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                In Stock
              </>
            )}
          </span>
          <div className="text-sm text-gray-700 font-medium">
            {currentStock} <span className="text-xs text-gray-500">{product.unit}</span>
          </div>
          <div className="text-xs text-gray-500">
            Alert at: {product.lowStockThreshold} {product.unit}
          </div>
        </div>
      );
    },
  },
  
  {
    id: "actions",
    header: () => <span className="hidden md:block font-semibold text-gray-700">Actions</span>,
    size: 160,
    cell: ({ row }) => {
      const product = row.original;
      return <DesktopActionsCell product={product} handleProductDeleted={handleProductDeleted} />;
    },
    enableSorting: false,
  },
];