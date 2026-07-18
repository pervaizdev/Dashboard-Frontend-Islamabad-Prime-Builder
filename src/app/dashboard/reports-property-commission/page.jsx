"use client";

import React, { useState, useEffect } from "react";
import { Users, ArrowRightLeft, CreditCard, X, Loader2 } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";

const Page = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/dashboard/property-commission");
        if (res.data.success) {
          setProperties(res.data.properties || []);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const openModal = (property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-10">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Property Commission Reports</h1>
            <p className="mt-2 text-sm text-slate-500">View commission and installment details for properties.</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Building / Floor / No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Plan</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No properties found.
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr key={property.property_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{property.property_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="font-medium text-slate-800">{property.building_name}</div>
                      <div className="text-xs">Floor number: {property.floor} - Plot number: {property.property_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="font-medium text-slate-800">{property.type}</div>
                      <div className="text-xs">{property.category}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{property.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div><span className="font-medium text-slate-700">Total:</span> Rs {property.total_price?.toLocaleString() || 0}</div>
                      <div className="text-xs mt-0.5"><span className="font-medium text-slate-700">Down Payment:</span> Rs {property.down_payment?.toLocaleString() || 0}</div>
                      <div className="text-xs mt-0.5"><span className="font-medium text-slate-700">Paid Deposit Amount : </span> Rs {property.paid_downpayment?.toLocaleString() || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="text-xs capitalize mt-1.5"><span className="bg-slate-100 text-slate-700 font-medium text-xs px-2 py-0.5 rounded-full border border-slate-200">{property.payment_plan}</span></div>
                      {property.allocationType && (
                        <div className="text-xs capitalize mt-2">
                          <span className={`font-medium  text-[11px] px-2 py-0.5 rounded-full border ${
                            property.allocationType.toLowerCase() === 'free'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-violet-50 text-violet-700 border-violet-200'
                          }`}>
                            Allocation Type : {property.allocationType}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        <button className="text-slate-400 hover:text-slate-800 transition-colors" title="Brokers">
                          <Users size={18} />
                        </button>
                        <button className="text-slate-400 hover:text-slate-800 transition-colors" title="Transfers">
                          <ArrowRightLeft size={18} />
                        </button>
                        <button
                          onClick={() => openModal(property)}
                          className="text-slate-400 hover:text-slate-800 transition-colors"
                          title="Installments & Details"
                        >
                          <CreditCard size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm"
              aria-hidden="true"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-slate-200">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800" id="modal-title">
                    Property Details - #{selectedProperty.property_id}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none bg-slate-50 hover:bg-slate-100 rounded-full p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-2 text-sm text-slate-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Basic Info</p>
                      <div className="space-y-2.5">
                        <p className="flex justify-between"><span className="font-medium text-slate-500">Building:</span> <span className="text-slate-800">{selectedProperty.building_name}</span></p>
                        <p className="flex justify-between"><span className="font-medium text-slate-500">Type:</span> <span className="text-slate-800">{selectedProperty.type}</span></p>
                        <p className="flex justify-between"><span className="font-medium text-slate-500">Category:</span> <span className="text-slate-800">{selectedProperty.category}</span></p>
                        <p className="flex justify-between"><span className="font-medium text-slate-500">Floor:</span> <span className="text-slate-800">{selectedProperty.floor}</span></p>
                        <p className="flex justify-between"><span className="font-medium text-slate-500">Number:</span> <span className="text-slate-800">{selectedProperty.property_number}</span></p>
                        <p className="flex justify-between"><span className="font-medium text-slate-500">Size:</span> <span className="text-slate-800">{selectedProperty.size}</span></p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Financials</p>
                      <div className="space-y-2.5">
                        <p className="flex justify-between"><span className="font-medium text-slate-500">Total Price:</span> <span className="text-slate-800 font-medium">Rs {selectedProperty.total_price?.toLocaleString() || 0}</span></p>
                        <p className="flex justify-between"><span className="font-medium text-slate-500">Down Payment:</span> <span className="text-slate-800">Rs {selectedProperty.down_payment?.toLocaleString() || 0}</span></p>
                        <p className="flex justify-between"><span className="font-medium text-slate-500">Paid DP:</span> <span className="text-slate-800">Rs {selectedProperty.paid_downpayment?.toLocaleString() || 0}</span></p>
                        <p className="flex justify-between items-center"><span className="font-medium text-slate-500">Plan:</span> <span className="capitalize bg-white text-slate-700 font-medium text-xs px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">{selectedProperty.payment_plan}</span></p>
                        {selectedProperty.allocationType && (
                          <p className="flex justify-between items-center mt-1">
                            <span className="font-medium text-slate-500">Allocation:</span> 
                            <span className={`capitalize font-medium text-[11px] px-2.5 py-1 rounded-md border shadow-sm ${
                              selectedProperty.allocationType.toLowerCase() === 'free'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-violet-50 text-violet-700 border-violet-200'
                            }`}>
                              {selectedProperty.allocationType}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <h4 className="font-semibold text-slate-800 pb-2 mb-3">Installments ({selectedProperty.installments?.length || 0})</h4>
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {selectedProperty.installments?.map((inst, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{inst.id || idx + 1}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 font-medium">Rs {inst.amount?.toLocaleString() || 0}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{inst.due_date}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border ${inst.status === 'Paid'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                  {inst.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {(!selectedProperty.installments || selectedProperty.installments.length === 0) && (
                            <tr>
                              <td colSpan="4" className="px-4 py-6 text-center text-sm text-slate-500 bg-slate-50">No installments found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-4 border-t border-slate-200 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 sm:ml-3 sm:w-auto transition-colors shadow-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;