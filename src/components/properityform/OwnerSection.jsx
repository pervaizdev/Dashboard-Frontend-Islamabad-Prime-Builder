"use client";

import SearchableSelect from "./SearchableSelect";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";

export default function OwnerSection({ formData, setFormData, usersList }) {
  const addOwner = () => {
    setFormData((prev) => ({
      ...prev,
      owners: [
        ...prev.owners,
        {
          userId: "",
          client_father_name: "",
          client_residential_address: "",
          client_permanent_address: "",
          occupation: "",
          age: "",
          client_cnic: "",
          nationality: "Pakistani",
        },
      ],
    }));
  };

  const removeOwner = (index) => {
    setFormData((prev) => ({
      ...prev,
      owners: prev.owners.filter((_, i) => i !== index),
    }));
  };

  const handleOwnerChange = async (index, field, value) => {
    setFormData((prev) => {
      const newOwners = [...prev.owners];
      newOwners[index] = { ...newOwners[index], [field]: value };
      return { ...prev, owners: newOwners };
    });

    // If userId is selected, try to fetch existing owner details for auto-population
    if (field === "userId" && value) {
      try {
        const res = await axiosInstance.get(`/property-details/owner/${value}`);
        if (res.data.success && res.data.ownerDetails) {
          const details = res.data.ownerDetails;
          setFormData((prev) => {
            const newOwners = [...prev.owners];
            // Only update current owner at this index
            newOwners[index] = {
              ...newOwners[index],
              client_father_name: details.client_father_name || newOwners[index].client_father_name,
              client_residential_address: details.client_residential_address || newOwners[index].client_residential_address,
              client_permanent_address: details.client_permanent_address || newOwners[index].client_permanent_address,
              occupation: details.occupation || newOwners[index].occupation,
              age: details.age || newOwners[index].age,
              client_cnic: details.client_cnic || newOwners[index].client_cnic,
              nationality: details.nationality || newOwners[index].nationality,
            };
            return { ...prev, owners: newOwners };
          });
          toast.success("Previous records found! Owner details auto-populated.");
        }
      } catch (error) {
        // Silently fail if no records exist
        console.log("No previous property records found for this user to auto-populate.");
      }
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Owner Details</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add one or multiple owners for this property.
          </p>
        </div>

        <button
          type="button"
          onClick={addOwner}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Add Owner
        </button>
      </div>

      <div className="space-y-4">
        {formData.owners.map((owner, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Owner {i + 1}
              </h3>

              {formData.owners.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOwner(i)}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <SearchableSelect 
                  label="Client Name" 
                  placeholder="Enter Client"
                  options={usersList || []} 
                  value={owner.userId} 
                  onChange={(val) => handleOwnerChange(i, "userId", val)}
                  secondaryKey1="phone"
                  secondaryKey2="email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Father Name
                </label>
                <input
                  type="text"
                  placeholder="Enter father name"
                  value={owner.client_father_name}
                  onChange={(e) => handleOwnerChange(i, "client_father_name", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Residential Address
                </label>
                <input
                  type="text"
                  placeholder="Enter residential address"
                  value={owner.client_residential_address}
                  onChange={(e) => handleOwnerChange(i, "client_residential_address", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Permanent Address
                </label>
                <input
                  type="text"
                  placeholder="Enter permanent address"
                  value={owner.client_permanent_address}
                  onChange={(e) => handleOwnerChange(i, "client_permanent_address", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Occupation
                </label>
                <input
                  type="text"
                  placeholder="Enter occupation"
                  value={owner.occupation}
                  onChange={(e) => handleOwnerChange(i, "occupation", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={owner.age}
                  onChange={(e) => handleOwnerChange(i, "age", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  CNIC
                </label>
                <input
                  type="text"
                  placeholder="Enter CNIC"
                  value={owner.client_cnic}
                  onChange={(e) => handleOwnerChange(i, "client_cnic", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nationality
                </label>
                <input
                  type="text"
                  placeholder="Enter nationality"
                  value={owner.nationality}
                  onChange={(e) => handleOwnerChange(i, "nationality", e.target.value)}
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