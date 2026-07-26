import React from 'react';
import { Image as ImageIcon, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const ExpendableInstallmentRow = ({ property }) => {
  return (
    <tr className="bg-slate-50">
      <td colSpan="10" className="p-0 border-b border-slate-200">
        <div className="p-4 bg-slate-50/50">
          <h4 className="font-semibold text-slate-800 mb-3">Installments Breakdown</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Month</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Paid Date</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {property.installments?.map((inst, idx) => {
                  const isPaid = inst.status?.toLowerCase() === 'paid';
                  const dueDate = inst.dueDate ? new Date(inst.dueDate) : null;
                  const isOverdue = !isPaid && dueDate && dueDate < new Date();

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 text-sm text-slate-600">{inst.monthYear || '-'}</td>
                      <td className="px-4 py-2 text-sm font-medium text-slate-800">Rs {inst.amount?.toLocaleString() || 0}</td>
                      <td className="px-4 py-2 text-sm">
                        {isPaid ? (
                          <span className="px-2 py-1 inline-flex text-[11px] leading-4 font-semibold rounded-md border bg-green-50 text-green-700 border-green-200">
                            Paid
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2 py-1 inline-flex items-center gap-1 text-[11px] leading-4 font-semibold rounded-md border bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle size={12} /> Payment Overdue
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-[11px] leading-4 font-semibold rounded-md border bg-amber-50 text-amber-700 border-amber-200">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-600">{inst.paidDate ? new Date(inst.paidDate).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2 text-sm text-center">
                        {isPaid ? (
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 text-xs font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (inst.receiptImage || inst.receipt || inst.image) {
                                window.open(inst.receiptImage || inst.receipt || inst.image, '_blank');
                              } else {
                                toast.error('No receipt image found');
                              }
                            }}
                          >
                            <ImageIcon size={14} /> View
                          </button>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
                {(!property.installments || property.installments.length === 0) && (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-sm text-slate-500">No installments found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default ExpendableInstallmentRow;
