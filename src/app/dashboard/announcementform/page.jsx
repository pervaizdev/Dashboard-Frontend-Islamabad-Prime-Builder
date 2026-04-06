export default function AnnouncementPage() {
  return (

      <div className="container mx-auto max-w-2xl lg:py-10 mt-12 lg:mt-0 px-4 lg:px-0">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-5">
            <h1 className="text-2xl font-bold text-slate-800">
              Add Announcement
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a new announcement with details
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5 px-6 py-6">

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter title"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows="4"
                placeholder="Enter description"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-slate-500"
              ></textarea>
            </div>

            {/* Start DateTime */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
              />
            </div>

            {/* End DateTime */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500"
              />
            </div>

            {/* Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add Announcement
              </button>
            </div>

          </form>
        </div>
      </div>
  );
}