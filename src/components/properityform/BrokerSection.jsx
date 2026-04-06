"use client";

import { useState } from "react";

export default function BrokerSection() {
  const [brokers, setBrokers] = useState([0]);

  const addBroker = () => {
    setBrokers([...brokers, brokers.length]);
  };

  const removeBroker = (index) => {
    setBrokers(brokers.filter((_, i) => i !== index));
  };

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

      <div className="space-y-4">
        {brokers.map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Broker {i + 1}
              </h3>

              {brokers.length > 1 && (
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Broker ID
                </label>
                <input
                  type="text"
                  placeholder="Enter broker id"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  User ID
                </label>
                <input
                  type="text"
                  placeholder="Enter user id"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Relationship
                </label>
                <input
                  type="text"
                  placeholder="Enter relationship"
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