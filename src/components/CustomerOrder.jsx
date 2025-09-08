import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { ref, onValue, off } from 'firebase/database';
import { database } from './firebase';
import { Download, RefreshCw, Search, Filter } from 'lucide-react';

const CustomerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  // PWA installation state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Handle PWA installation prompt
  useEffect(() => {
    // Log to debug if beforeinstallprompt is firing
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e); // Store prompt for later use
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('appinstalled event fired');
      localStorage.setItem('pwaInstalled', 'true');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup event listeners
    return () => {
      console.log('Cleaning up PWA event listeners');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger PWA installation
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      console.log('Install button clicked, showing prompt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      if (outcome === 'accepted') {
        localStorage.setItem('pwaInstalled', 'true');
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      console.log('No deferredPrompt available');
    }
  };

  useEffect(() => {
    const customerOrdersRef = ref(database, 'customerOrders');
    
    const handleOrderData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedOrders = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        console.log('Fetched Customer Orders:', loadedOrders);
        setOrders(loadedOrders);
      } else {
        console.log('No customer orders found in Firebase');
        setOrders([]);
      }
      setLoading(false);
    };

    onValue(customerOrdersRef, handleOrderData, (error) => {
      console.error("Error fetching customer orders:", error);
      setOrders([]);
      setLoading(false);
    });

    return () => off(customerOrdersRef);
  }, []);

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.includes(searchTerm) ||
        order.tokenNumber?.toString().includes(searchTerm) ||
        order.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.orderDate) - new Date(a.orderDate);
        case 'oldest':
          return new Date(a.orderDate) - new Date(b.orderDate);
        case 'tokenAsc':
          return a.tokenNumber - b.tokenNumber;
        case 'tokenDesc':
          return b.tokenNumber - a.tokenNumber;
        case 'amountAsc':
          return a.totalAmount - b.totalAmount;
        case 'amountDesc':
          return b.totalAmount - a.totalAmount;
        default:
          return 0;
      }
    });

  const downloadPDF = (order) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");

    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("MAHITHRAA SRI CRACKERS", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text("Vanamoorthilingapuram,", 105, 30, { align: "center" });
    doc.text("Madathupatti, Sivakasi - 626123", 105, 35, { align: "center" });
    doc.text("Phone no.: +919080533427 & +918110087349", 105, 40, { align: "center" });

    doc.setFontSize(14);
    doc.text("Customer Order Details", 20, 55);

    // Order Information
    doc.setFontSize(10);
    doc.text(`Token No.: ${order.tokenNumber || 'N/A'}`, 20, 70);
    doc.text(`Invoice No.: ${order.invoiceNumber || 'N/A'}`, 20, 75);
    doc.text(`Order Date: ${order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB') : 'N/A'}`, 20, 80);
    doc.text(`Status: ${order.status || 'N/A'}`, 20, 85);
    doc.text(`PDF Downloaded: ${order.pdfDownloaded ? 'Yes' : 'No'}`, 20, 90);

    // Customer Information
    doc.text("Customer Details:", 20, 105);
    doc.text(`Name: ${order.customer || 'N/A'}`, 20, 110);
    doc.text(`Phone: ${order.phone || 'N/A'}`, 20, 115);
    doc.text(`Address: ${order.address || 'N/A'}`, 20, 120);
    doc.text(`City: ${order.city || 'N/A'}`, 20, 125);

    // Order Items
    let yPos = 140;
    doc.text("Order Items:", 20, yPos);
    yPos += 10;

    if (order.cart && order.cart.length > 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos, 190, 8, "F");
      doc.text("Item", 12, yPos + 5);
      doc.text("Qty", 120, yPos + 5);
      doc.text("Price", 140, yPos + 5);
      doc.text("Total", 170, yPos + 5);
      yPos += 10;

      order.cart.forEach((item) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        const itemName = item.productName?.length > 40 ? 
          item.productName.substring(0, 40) + "..." : 
          item.productName || 'N/A';
        
        doc.text(itemName, 12, yPos + 5);
        doc.text((item.quantity || 0).toString(), 122, yPos + 5);
        doc.text(`₹${(item.ourPrice || 0).toFixed(2)}`, 142, yPos + 5);
        doc.text(`₹${((item.ourPrice || 0) * (item.quantity || 0)).toFixed(2)}`, 172, yPos + 5);
        yPos += 8;
      });
    } else {
      doc.text("No items in cart", 20, yPos + 5);
      yPos += 10;
    }

    // Total Amount
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: ₹${(order.totalAmount || 0).toFixed(2)}`, 20, yPos);

    const fileName = `customer_order_token_${order.tokenNumber}_${order.customer || 'unknown'}.pdf`;
    doc.save(fileName);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshOrders = () => {
    setLoading(true);
    // The useEffect will automatically fetch new data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600 text-lg">Loading customer orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Customer Orders</h2>
            <p className="text-gray-600 mt-1">
              Total Orders: {filteredOrders.length} | 
              Showing: {filteredOrders.length} results
            </p>
          </div>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <button
              onClick={refreshOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 flex items-center"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
            {/* Install Button - Shown if prompt is available and not installed */}
            {deferredPrompt && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150 flex items-center"
              >
                <Download size={16} className="mr-2" />
                Install App
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, phone, token, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="tokenDesc">Token No. (High to Low)</option>
                <option value="tokenAsc">Token No. (Low to High)</option>
                <option value="amountDesc">Amount (High to Low)</option>
                <option value="amountAsc">Amount (Low to High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 text-lg">
              {searchTerm || statusFilter !== 'All' ? 
                'No orders match your search criteria.' : 
                'No customer orders found.'
              }
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-800 text-white">
                  <tr>
                    <th className="p-4 font-medium">Token No.</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">City</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">PDF Status</th>
                    <th className="p-4 font-medium">Order Date</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id || index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
                    >
                      <td className="p-4">
                        <div className="font-medium text-blue-600">
                          #{order.tokenNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Invoice: {order.invoiceNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">
                          {order.customer || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {order.address || 'No address'}
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">
                        {order.phone || 'N/A'}
                      </td>
                      <td className="p-4 text-gray-700">
                        {order.city || 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-green-600">
                          ₹{(order.totalAmount || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Items: {order.cart ? order.cart.length : 0}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.pdfDownloaded 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.pdfDownloaded ? 'Downloaded' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">
                        <div>
                          {order.orderDate ? 
                            new Date(order.orderDate).toLocaleDateString('en-GB') : 
                            'N/A'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.orderDate ? 
                            new Date(order.orderDate).toLocaleTimeString('en-GB', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 
                            ''
                          }
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => downloadPDF(order)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 flex items-center text-sm"
                        >
                          <Download size={14} className="mr-1" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-blue-600">
                {orders.length}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-green-600">
                ₹{orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(order => order.status === 'Pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Orders</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-purple-600">
                {orders.filter(order => order.pdfDownloaded).length}
              </div>
              <div className="text-sm text-gray-600">PDFs Downloaded</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrder;