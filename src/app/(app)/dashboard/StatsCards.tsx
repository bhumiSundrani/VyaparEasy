"use client";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import React, { useEffect, useState } from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ErrorIcon from "@mui/icons-material/Error";
import PaymentsIcon from "@mui/icons-material/Payments";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { Loader2 } from "lucide-react";

interface StatsData {
  sales: number;
  purchases: number;
  creditSales: number;
  outstandingCredit: number;
  cashReceived: number;
  inventoryAmount: number;
}

const StatCard = ({
  title,
  amount,
  icon: Icon,
  color,
}: {
  title: string;
  amount: number;
  icon: any;
  color: string;
}) => (
  <Card className="bg-white shadow-md hover:shadow-xl transition-shadow rounded-xl duration-300">
    <CardContent className="flex flex-col items-center text-center p-4 sm:p-6 space-y-3 sm:space-y-4">
      {/* Icon */}
      <span
        className="rounded-full p-3 sm:p-4 lg:p-5 shadow-md"
        style={{ backgroundColor: color }}
      >
        <Icon className="text-white w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
      </span>

      {/* Title & Amount */}
      <div>
        <h2 className="text-sm sm:text-base lg:text-lg font-medium text-gray-700">{title}</h2>
        <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(amount || 0)}
        </p>
      </div>
    </CardContent>
  </Card>
);

const StatsCards = () => {
  const [stats, setStats] = useState<StatsData | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/dashboard/get-stats");
        if (res.data) setStats(res.data.stats);
      } catch (error) {
        console.log("Error fetching stats data: ", error);
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, []);

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="sm:text-2xl text-xl font-bold text-gray-800 mb-6">
          Today&apos;s Stats
        </div>

        {/* Grid Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title="Total Sales"
            amount={stats?.sales || 0}
            icon={TrendingUpIcon}
            color="#4CAF50"
          />
          <StatCard
            title="Total Purchase"
            amount={stats?.purchases || 0}
            icon={LocalMallIcon}
            color="#2196F3"
          />
          <StatCard
            title="Credit Sales"
            amount={stats?.creditSales || 0}
            icon={CreditCardIcon}
            color="#9C27B0"
          />
          <StatCard
            title="Outstanding Credit"
            amount={stats?.outstandingCredit || 0}
            icon={ErrorIcon}
            color="#FF5722"
          />
          <StatCard
            title="Cash Received"
            amount={stats?.cashReceived || 0}
            icon={PaymentsIcon}
            color="#009688"
          />
          <StatCard
            title="Total Inventory"
            amount={stats?.inventoryAmount || 0}
            icon={WarehouseIcon}
            color="#FFC107"
          />
        </div>
        )}
      </div>
    </div>
  );
};

export default StatsCards;
