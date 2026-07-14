"use client";

import { useAuth } from "@/lib/providers/AuthProvider";
import { PinPad } from "@/components/auth/PinPad";
import { Landing } from "@/components/auth/Landing";
import { type StaffMember } from "@/lib/constants";

export default function HomePage() {
  const { isAuthenticated, isLoading, signIn } = useAuth();

  const handlePinSuccess = (user: StaffMember) => {
    signIn(user.pin);
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <PinPad onSuccess={handlePinSuccess} />;
  }

  return <Landing />;
}
