import React from "react";
import { X, AlertTriangle } from "lucide-react";

const ReportsPropertyModal = ({ isOpen, onClose, selectedProperty, modalType }) => {
  if (!isOpen || !selectedProperty) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-[#08211e]/60 backdrop-blur-sm"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-[#c29e6d]/30">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#c29e6d]/20">
              <h3 className="text-xl font-bold text-[#08211e]" id="modal-title">
                {modalType === 'owner' ? `Owner Details ` :
                  modalType === 'broker' ? `Broker Details` :
                    modalType === 'transfer' ? `Transfer History` :
                      `Property Details`}
              </h3>
              <button
                onClick={onClose}
                className="text-[#c29e6d] hover:text-[#08211e]/80 transition-colors focus:outline-none bg-[#c29e6d]/10 hover:bg-[#c29e6d]/20 rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>

            {modalType === 'installments' && (
              <div className="mt-2 text-sm text-[#08211e]/80">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="bg-[#c29e6d]/10 p-4 rounded-xl border border-[#c29e6d]/20">
                    <p className="font-semibold text-[#08211e] border-b border-[#c29e6d]/30 pb-2 mb-3">Basic Info</p>
                    <div className="space-y-2.5">
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Building:</span> <span className="text-[#08211e]">{selectedProperty.building_name}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Type:</span> <span className="text-[#08211e]">{selectedProperty.type}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Category:</span> <span className="text-[#08211e]">{selectedProperty.category}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Floor:</span> <span className="text-[#08211e]">{selectedProperty.floor}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Number:</span> <span className="text-[#08211e]">{selectedProperty.property_number}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Size:</span> <span className="text-[#08211e]">{selectedProperty.size}</span></p>
                    </div>
                  </div>

                  <div className="bg-[#c29e6d]/10 p-4 rounded-xl border border-[#c29e6d]/20">
                    <p className="font-semibold text-[#08211e] border-b border-[#c29e6d]/30 pb-2 mb-3">Financials</p>
                    <div className="space-y-2.5">
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Total Price:</span> <span className="text-[#08211e] font-medium">Rs {selectedProperty.total_price?.toLocaleString() || 0}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Down Payment:</span> <span className="text-[#08211e]">Rs {selectedProperty.down_payment?.toLocaleString() || 0}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Paid DP:</span> <span className="text-[#08211e]">Rs {selectedProperty.paid_downpayment?.toLocaleString() || 0}</span></p>
                      <p className="flex justify-between items-center"><span className="font-medium text-[#08211e]/70">Plan:</span> <span className="capitalize bg-white text-[#08211e]/90 font-medium text-xs px-2.5 py-1 rounded-md border border-[#c29e6d]/30 shadow-sm">{selectedProperty.payment_plan}</span></p>
                      {selectedProperty.allocationType && (
                        <p className="flex justify-between items-center mt-1">
                          <span className="font-medium text-[#08211e]/70">Allocation:</span>
                          <span className={`capitalize font-medium text-[11px] px-2.5 py-1 rounded-md border shadow-sm ${selectedProperty.allocationType.toLowerCase() === 'free'
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
                  <h4 className="font-semibold text-[#08211e] pb-2 mb-3">Installments ({selectedProperty.installments?.length || 0})</h4>
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-[#c29e6d]/30">
                    <table className="min-w-full divide-y divide-[#c29e6d]/30">
                      <thead className="bg-[#c29e6d]/10 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#08211e]/70 uppercase tracking-wider">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#08211e]/70 uppercase tracking-wider">Month</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#08211e]/70 uppercase tracking-wider">Due Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#08211e]/70 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-[#08211e]/70 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#c29e6d]/20">
                        {selectedProperty.installments?.map((inst, idx) => {
                          const isPaid = inst.status?.toLowerCase() === 'paid';
                          const dueDate = inst.dueDate ? new Date(inst.dueDate) : null;
                          const isOverdue = !isPaid && dueDate && dueDate < new Date();

                          return (
                            <tr key={idx} className="hover:bg-[#c29e6d]/10 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-[#08211e]/70">{inst.id || idx + 1}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-[#08211e]/70">{inst.monthYear || '-'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-[#08211e]/70">{dueDate ? dueDate.toLocaleDateString() : '-'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-[#08211e] font-medium">Rs {inst.amount?.toLocaleString() || 0}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {isPaid ? (
                                  <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border bg-green-50 text-green-700 border-green-200">
                                    Paid
                                  </span>
                                ) : isOverdue ? (
                                  <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-md border bg-red-50 text-red-700 border-red-200">
                                    <AlertTriangle size={14} /> Payment Overdue
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border bg-amber-50 text-amber-700 border-amber-200">
                                    Unpaid
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {(!selectedProperty.installments || selectedProperty.installments.length === 0) && (
                          <tr>
                            <td colSpan="5" className="px-4 py-6 text-center text-sm text-[#08211e]/70 bg-[#c29e6d]/10">No installments found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'owner' && (
              <div className="mt-2 text-sm text-[#08211e]/80">
                {selectedProperty.owners?.map((owner, idx) => (
                  <div key={idx} className="bg-[#c29e6d]/10 p-4 rounded-xl border border-[#c29e6d]/20 mb-4">
                    <div className="space-y-2.5">
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Name:</span> <span className="text-[#08211e]">{owner.name}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Father's Name:</span> <span className="text-[#08211e]">{owner.client_father_name || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">CNIC:</span> <span className="text-[#08211e]">{owner.client_cnic || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Occupation:</span> <span className="text-[#08211e]">{owner.occupation || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Nationality:</span> <span className="text-[#08211e]">{owner.nationality || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Residential Address:</span> <span className="text-[#08211e] text-right max-w-xs">{owner.client_residential_address || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Permanent Address:</span> <span className="text-[#08211e] text-right max-w-xs">{owner.client_permanent_address || '-'}</span></p>
                    </div>
                  </div>
                ))}
                {(!selectedProperty.owners || selectedProperty.owners.length === 0) && (
                  <p className="text-center text-[#08211e]/70 py-4">No owner details found.</p>
                )}
              </div>
            )}

            {modalType === 'broker' && (
              <div className="mt-2 text-sm text-[#08211e]/80">
                {selectedProperty.brokers?.map((broker, idx) => (
                  <div key={idx} className="bg-[#c29e6d]/10 p-4 rounded-xl border border-[#c29e6d]/20 mb-4">
                    <div className="space-y-2.5">
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Name:</span> <span className="text-[#08211e]">{broker.name}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Relationship:</span> <span className="text-[#08211e] capitalize">{broker.relationship || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Commission:</span> <span className="text-[#08211e] font-medium">Rs {broker.broker_commission?.toLocaleString() || 0}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Paid Commission:</span> <span className="text-[#08211e]">Rs {broker.paid_commission?.toLocaleString() || 0}</span></p>
                    </div>
                  </div>
                ))}
                {(!selectedProperty.brokers || selectedProperty.brokers.length === 0) && (
                  <p className="text-center text-[#08211e]/70 py-4">No broker details found.</p>
                )}
              </div>
            )}

            {modalType === 'transfer' && (
              <div className="mt-2 text-sm text-[#08211e]/80">
                {selectedProperty.transferHistory?.map((transfer, idx) => (
                  <div key={idx} className="bg-[#c29e6d]/10 p-4 rounded-xl border border-[#c29e6d]/20 mb-4">
                    <div className="space-y-2.5">
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Transfer Date:</span> <span className="text-[#08211e]">{new Date(transfer.transferDate).toLocaleDateString()}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Transferred By:</span> <span className="text-[#08211e]">{transfer.transferredBy || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">New Owner Name:</span> <span className="text-[#08211e]">{transfer.newOwnerName || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">New Owner CNIC:</span> <span className="text-[#08211e]">{transfer.newOwnerCNIC || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">New Owner Phone:</span> <span className="text-[#08211e]">{transfer.newOwnerPhone || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Temp Address:</span> <span className="text-[#08211e] text-right max-w-xs">{transfer.temporaryAddress || '-'}</span></p>
                      <p className="flex justify-between"><span className="font-medium text-[#08211e]/70">Perm Address:</span> <span className="text-[#08211e] text-right max-w-xs">{transfer.permanentAddress || '-'}</span></p>
                    </div>
                  </div>
                ))}
                {(!selectedProperty.transferHistory || selectedProperty.transferHistory.length === 0) && (
                  <p className="text-center text-[#08211e]/70 py-4">No transfer history found.</p>
                )}
              </div>
            )}
          </div>
          <div className="bg-[#c29e6d]/10 px-4 py-4 border-t border-[#c29e6d]/30 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-lg bg-[#08211e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#08211e]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c29e6d] sm:ml-3 sm:w-auto transition-colors shadow-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPropertyModal;
