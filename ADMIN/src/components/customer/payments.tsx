import React, { useState, useEffect } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPayments, Payment } from "../../api/payment";
import {
  ChevronDown,
  Calendar as CalendarIcon,
  Search,
  RefreshCw,
} from "lucide-react";

const PaymentDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPayments();
  };

  const getFilteredPayments = () => {
    let filtered = payments;

    // Filter by date
    filtered = filtered.filter((payment) =>
      isSameDay(parseISO(payment.created_at), selectedDate)
    );

    // Filter by status if not "all"
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (payment) => payment.payment_status === activeTab
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.userName.toLowerCase().includes(query) ||
          payment.phone_number.includes(query)
      );
    }

    return filtered;
  };

  const filteredPayments = getFilteredPayments();

  const totalAmount = filteredPayments.reduce((sum, payment) => {
    return payment.payment_status === "success" ? sum + payment.amount : sum;
  }, 0);

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Payment Transactions
          </h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border shadow-sm hover:bg-gray-50"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>{format(selectedDate, "dd MMM yyyy")}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              {isCalendarOpen && (
                <div className="absolute right-0 mt-2 z-10">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    className="bg-white border rounded-md shadow-lg p-3"
                  />
                </div>
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-md hover:bg-gray-100"
              title="Refresh data"
            >
              <RefreshCw className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Transactions</CardDescription>
              <CardTitle className="text-2xl">
                {filteredPayments.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Successful Payments</CardDescription>
              <CardTitle className="text-2xl text-green-600">
                {
                  filteredPayments.filter((p) => p.payment_status === "success")
                    .length
                }
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Amount (Success)</CardDescription>
              <CardTitle className="text-2xl">
                ₹{totalAmount.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <CardTitle>Transaction Details</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  className="pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-4"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="success">Successful</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-md">
                    <p className="text-gray-500">
                      No transactions found for the selected criteria.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Items</TableHead>
                          <TableHead className="font-semibold">
                            Amount
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => (
                          <TableRow
                            key={payment._id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              {payment.userName}
                            </TableCell>
                            <TableCell>{payment.phone_number}</TableCell>
                            <TableCell>
                              {payment.order_items.length} items
                            </TableCell>
                            <TableCell className="font-medium">
                              ₹{payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  payment.payment_status === "success"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : payment.payment_status === "failed"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                }
                              >
                                {payment.payment_status === "success"
                                  ? "Successful"
                                  : payment.payment_status === "failed"
                                  ? "Failed"
                                  : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(parseISO(payment.created_at), "hh:mm a")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentDashboard;
