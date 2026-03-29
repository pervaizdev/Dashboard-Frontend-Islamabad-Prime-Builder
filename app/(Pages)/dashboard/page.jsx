"use client";

import useProfile from "@/Hooks/useProfile";
import ProfileCard from "@/Components/ProfileCard.jsx";

const DashboardPage = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#08211e] p-6">
        <div className="rounded-3xl border border-[#c29e6d]/20 bg-[#f8f6f2] px-8 py-6 shadow-lg">
          <p className="text-lg font-medium text-[#08211e]">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {profile ? (
        <ProfileCard profile={profile} />
      ) : (
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-lg">
          <p className="text-red-500">Profile not found.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;