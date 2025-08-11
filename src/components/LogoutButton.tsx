import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";

interface LogoutButtonProps {
  setPageLoading: (loading: boolean) => void;
}

export function LogoutButton({ setPageLoading }: LogoutButtonProps) {
  const [logout, setLogout] = useState(false);
  const router = useRouter();
  
  const handleLogout = async () => {
    setLogout(true);// Set page loading to true when logout starts
    
    try {
      await axios.post('/api/user/logout');
      setPageLoading(true); 
      router.push('/verify-user');
    } catch (error) {
      console.log("Error logging out user", error);
      setPageLoading(false); // Reset page loading on error
    } finally {
      setLogout(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={logout}
          className={
            `h-9 px-3 text-sm font-medium bg-white flex items-center gap-2 transition-colors duration-300 ${logout ? "opacity-80 cursor-not-allowed" : "hover:bg-red-100 rounded-full"}`
          }
        >
          {logout ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
          ) : (
            <>
              <FiLogOut className="h-4 w-4 text-red-600" />
            </>
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to logout?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will log you out. You&apos;ll need to log in again to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-700"
              onClick={handleLogout}
              disabled={logout}
            >
              {logout ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes, logout"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}