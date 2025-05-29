"use client"
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Edit} from "lucide-react"
import { DeleteProductButton } from "@/components/DeleteProductButton";
import axios from "axios";
import { toast } from "sonner";

export interface CategoryColumnData {
  _id: string;
  name: string;
  parentCategory?: {
    _id: string;
    name: string;
  } | null;
  imageUrl: string | null;
  slug: string;
}

// Create a separate React component for the mobile card cell
const MobileCardCell: React.FC<{ category: CategoryColumnData; onCategoryDeleted: () => void }> = ({ category, onCategoryDeleted }) => {
  const router = useRouter();
  const [editDisabled, setEditDisabled] = useState(false);

  const handleEdit = () => {
    setEditDisabled(true);
    router.push(`/all-categories/${category._id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/categories/${category._id}`);
      toast.success("Category deleted successfully", { icon: "✅" });
      onCategoryDeleted();
    } catch {
      toast.error("Error deleting category", { icon: "❌" });
    }
  };

  return (
    <div className="md:hidden w-full md:-mx-4">
      <MobileCategoryCard
        category={category}
        onEdit={handleEdit}
        onDelete={handleDelete}
        editDisabled={editDisabled}
      />
    </div>
  );
};


// Mobile Card Component for Categories
const MobileCategoryCard = ({ category, onEdit, onDelete, editDisabled }: {
  category: CategoryColumnData;
  onEdit: () => void;
  onDelete: () => Promise<void>;
  editDisabled: boolean;
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 space-y-3 mb-3 max-w-[320px] ml-auto mr-auto">
      {/* Header Section - Image and Basic Info */}
      <div className="flex items-start gap-3">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200 shadow-sm">
          <img 
            src={category.imageUrl || '/product-icon-png-19.jpg'} 
            alt={category.name}
            className="object-cover w-full h-full transition-transform hover:scale-105" 
            onError={(e) => {
              console.error("Error loading image:", category.imageUrl);
              e.currentTarget.src = '/product-icon-png-19.jpg';
            }}
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-gray-900 leading-tight mb-1 line-clamp-2">
            {category.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">
              Parent: {category.parentCategory?.name || "None"}
            </span>
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
              Edit Category
            </>
          )}
        </Button>
        
        <DeleteProductButton onDelete={onDelete} />
      </div>
    </div>
  );
};

const ActionsCell: React.FC<{ category: CategoryColumnData; onCategoryDeleted: () => void }> = ({ category, onCategoryDeleted }) => {
  const router = useRouter();
  const [editDisabled, setEditDisabled] = useState(false);

  const handleDeleteCategory = async () => {
    try {
      await axios.delete(`/api/categories/${category._id}`);
      toast.success("Category deleted successfully", { icon: "✅" });
      onCategoryDeleted();
    } catch {
      toast.error("Error deleting category", { icon: "❌" });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={editDisabled}
        onClick={() => {
          setEditDisabled(true);
          router.push(`/all-categories/${category._id}/edit`);
        }}
        className="h-9 px-3 text-sm font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
      >
        {editDisabled ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Edit className="h-3 w-3 mr-1.5" />Edit</>}
      </Button>

      <DeleteProductButton onDelete={handleDeleteCategory} />
    </div>
  );
};


export const CategoryColumns = (handleCategoryDeleted: () => void): ColumnDef<CategoryColumnData>[] => [
  // Mobile-first: Single column that renders cards on mobile, hidden on desktop
  {
  id: "mobile-card",
  header: () => null,
  cell: ({ row }) => <MobileCardCell category={row.original} onCategoryDeleted={handleCategoryDeleted} />,
  enableSorting: false,
},
  {
    id: "serial",
    header: () => <span className="font-semibold text-gray-700">#</span>,
    cell: ({ row }) => (
      <span className="flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-500 bg-gray-100 rounded-full">
        {row.index + 1}
      </span>
    ),
    enableSorting: false,
    size: 60,
  },
  {
    accessorKey: "imageUrl",
    header: () => <span className="font-semibold text-gray-700">Image</span>,
    cell: ({ getValue }) => {
      const url = getValue() as string;
      return (
        <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <img 
            src={url || '/product-icon-png-19.jpg'} 
            alt="Category" 
            className="object-cover w-full h-full hover:scale-105 transition-transform" 
            onError={(e) => {
              console.error("Error loading image:", url);
              e.currentTarget.src = '/product-icon-png-19.jpg';
            }}
            loading="lazy"
          />
        </div>
      );
    },
    size: 90,
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: () => <span className="font-semibold text-gray-700">Category Name</span>,
    size: 200,
    cell: ({ getValue }) => (
      <div className="font-semibold text-gray-900">
        {getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: "parentCategory",
    header: () => <span className="font-semibold text-gray-700">Parent Category</span>,
    size: 200,
    cell: ({ getValue }) => {
      const parentCategory = getValue() as { name: string } | null;
      return (
        <div className="text-gray-600">
          {parentCategory ? parentCategory.name : "None"}
        </div>
      );
    },
  },
  {
  id: "actions",
  header: () => <span className="font-semibold text-gray-700">Actions</span>,
  size: 160,
  cell: ({ row }) => <ActionsCell category={row.original} onCategoryDeleted={handleCategoryDeleted} />,
  enableSorting: false,
}

]; 