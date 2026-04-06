import PropertySection from "@/components/properityform/Propertysection";
import OwnerSection from "@/components/properityform/OwnerSection";
import BrokerSection from "@/components/properityform/BrokerSection";

export default function PropertyFormPage() {
  return (

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-10">
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Property Form
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter property, owner, and broker details below.
            </p>
          </div>

          <form className="space-y-6 px-6 py-6 sm:px-8">
            <PropertySection />
            <OwnerSection />
            <BrokerSection />

            <div className="flex justify-end border-t border-slate-200 pt-6">
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Submit Form
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}