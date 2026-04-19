"use client";

import { useEffect } from "react";
import SearchableSelect from "./SearchableSelect";

export default function BrokerSection({ formData, setFormData, brokersList, usersList }) {
  const validOwnerUserIds = (formData.owners || [])
    .map(o => String(o.userId))
    .filter(id => id !== "");

  const ownerOptions = (usersList || [])
    .filter(u => validOwnerUserIds.includes(String(u.userId)))
    .map(u => ({ userId: u.userId, name: u.name, phone: u.phone, email: u.email }));

  const addBroker = () => {
    setFormData((prev) => ({
      ...prev,
      brokers: [
        ...prev.brokers,
        {
          broker_id: "",
          userId: ownerOptions.length === 1 ? ownerOptions[0].userId : "",
          relationship: "",
        },
      ],
    }));
  };

  const removeBroker = (index) => {
    setFormData((prev) => ({
      ...prev,
      brokers: prev.brokers.filter((_, i) => i !== index),
    }));
  };

  const handleBrokerChange = (index, field, value) => {
    setFormData((prev) => {
      const newBrokers = [...prev.brokers];
      newBrokers[index] = { ...newBrokers[index], [field]: value };
      return { ...prev, brokers: newBrokers };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "broker_commission") {
      const numericValue = Math.round(Math.max(0, parseFloat(value) || 0));
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    if (ownerOptions.length === 1) {
      const singleOwnerId = ownerOptions[0].userId;
      setFormData((prev) => {
        let changed = false;
        const newBrokers = (prev.brokers || []).map(b => {
          if (b.userId === "" || !validOwnerUserIds.includes(String(b.userId))) {
            changed = true;
            return { ...b, userId: singleOwnerId };
          }
          return b;
        });
        return changed ? { ...prev, brokers: newBrokers } : prev;
      });
    }
  }, [ownerOptions.length]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Broker Details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add one or multiple brokers for this property.
          </p>
        </div>

        <button
          type="button"
          onClick={addBroker}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add Broker
        </button>
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-700">
              Commission Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Total commission amount shared among all brokers.
            </p>
          </div>
          <div className="relative min-w-[240px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <span className="text-sm font-bold ">Rs.</span>
            </div>
            <input
              name="broker_commission"
              value={formData.broker_commission}
              onChange={handleChange}
              type="number"
              min="0"
              placeholder="0.00"
              className="w-full rounded-lg border border-slate-200  pl-11 pr-16 py-2.5 text-base font-bold  outline-none transition-all "
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight text-emerald-700">
                5%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {formData.brokers.map((broker, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Broker {i + 1}
              </h3>

              {formData.brokers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBroker(i)}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <SearchableSelect 
                  label="Broker Name" 
                  placeholder="Enter Broker Name"
                  options={brokersList || []} 
                  idKey="broker_id"
                  nameKey="name"
                  value={broker.broker_id} 
                  onChange={(val) => handleBrokerChange(i, "broker_id", val)}
                  secondaryKey1="cnic"
                  secondaryKey2="phone"
                  required
                />
              </div>

              <div>
                <SearchableSelect 
                  label="User ID" 
                  placeholder="Select Owner Representation"
                  options={ownerOptions} 
                  idKey="userId"
                  nameKey="name"
                  value={broker.userId} 
                  onChange={(val) => handleBrokerChange(i, "userId", val)}
                  secondaryKey1="phone"
                  secondaryKey2="email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Relationship
                </label>
                <input
                  type="text"
                  placeholder="Enter relationship"
                  value={broker.relationship}
                  onChange={(e) => handleBrokerChange(i, "relationship", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}