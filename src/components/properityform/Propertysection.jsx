"use client";

export default function PropertySection({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "total_price") {
      const price = Math.max(0, parseFloat(value) || 0);
      const commission = (price * 0.05).toFixed(2);
      setFormData((prev) => ({ 
        ...prev, 
        [name]: price,
        broker_commission: commission 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

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
            name="type"
            value={formData.type}
            onChange={handleChange}
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
            name="property_number"
            value={formData.property_number}
            onChange={handleChange}
            type="text"
            placeholder="Enter property number"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>

        {/* Building Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Building Name
          </label>
          <select 
            name="building_name"
            value={formData.building_name}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          >
            <option value="">Select Building</option>
            <option>Islamabad Prime Builder</option>
            <option>Prime Mall And Suites</option>
            <option>Prime Mall</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select 
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          >
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
            name="floor"
            value={formData.floor}
            onChange={handleChange}
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
            name="size"
            value={formData.size}
            onChange={handleChange}
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
            name="total_price"
            value={formData.total_price}
            onChange={handleChange}
            type="number"
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
            name="down_payment"
            value={formData.down_payment}
            onChange={handleChange}
            type="number"
            placeholder="Enter down payment"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>

        {/* Payment Plan */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Payment Plan
          </label>
          <select 
            name="payment_plan"
            value={formData.payment_plan}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          >
            <option value="">Select Plan</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Start Date
          </label>
          <input
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            type="date"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>
    </div>
  );
}