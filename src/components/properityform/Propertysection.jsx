export default function PropertySection() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Property Details
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Fill the basic information about the property.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        
        {/* Type */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Type
          </label>
          <input
            type="text"
            placeholder="Enter type"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>

        {/* Property Number */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Property Number
          </label>
          <input
            type="text"
            placeholder="Enter property number"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>

        {/* Building Name (Dropdown) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Building Name
          </label>
          <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500">
            <option value="">Select Building</option>
            <option>Prime Mall And Suites</option>
            <option>Prime Mall</option>
          </select>
        </div>

        {/* Category (Dropdown) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500">
            <option value="">Select Category</option>
            <option>Commercial</option>
            <option>Apartment</option>
            <option>Commercial and Apartment</option>
          </select>
        </div>

        {/* Floor */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Floor
          </label>
          <input
            type="text"
            placeholder="Enter floor"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>

        {/* Size */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Size
          </label>
          <input
            type="text"
            placeholder="Enter size"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>

        {/* Total Price */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Total Price
          </label>
          <input
            type="text"
            placeholder="Enter total price"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>

        {/* Down Payment */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Down Payment
          </label>
          <input
            type="text"
            placeholder="Enter down payment"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>

        {/* Payment Plan (Dropdown) */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Payment Plan
          </label>
          <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500">
            <option value="">Select Plan</option>
            <option>Quarterly</option>
            <option>Monthly</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Start Date
          </label>
          <input
            type="date"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>

      </div>
    </div>
  );
}