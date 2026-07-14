"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/providers/AuthProvider";
import { NAV_ITEMS } from "@/lib/constants";
import { TopBar } from "@/components/pos/TopBar";
import { DEMO_ACTION_ITEMS } from "@/lib/demo-data";
import { AttendanceScreen } from "@/components/attendance/AttendanceScreen";
import { ActionListScreen } from "@/components/actions/ActionListScreen";
import { MailroomScreen } from "@/components/mailroom/MailroomScreen";
import { LockersScreen } from "@/components/lockers/LockersScreen";
import { ShowersScreen } from "@/components/showers/ShowersScreen";
import { ReportsScreen } from "@/components/reports/ReportsScreen";

function POSContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const screen = searchParams.get("screen") ?? "attendance";

  const handleScreenChange = useCallback(
    (s: string) => {
      router.push(`/pos?screen=${s}`);
    },
    [router]
  );

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    router.push("/");
    return null;
  }

  const visibleScreens = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  ).map((item) => item.key);

  const activeScreen = visibleScreens.includes(screen) ? screen : visibleScreens[0];

  return (
    <div className="h-screen overflow-y-auto flex flex-col">
      <TopBar
        activeScreen={activeScreen}
        onScreenChange={handleScreenChange}
        badgeCounts={{ actions: DEMO_ACTION_ITEMS.filter((a) => a.status !== "done").length }}
      />
      {activeScreen === "attendance" && <AttendanceScreen />}
      {activeScreen === "actions" && <ActionListScreen />}
      {activeScreen === "mailroom" && <MailroomScreen />}
      {activeScreen === "lockers" && <LockersScreen />}
      {activeScreen === "showers" && <ShowersScreen />}
      {activeScreen === "reports" && <ReportsScreen />}
    </div>
  );
}

export default function POSPage() {
  return (
    <Suspense>
      <POSContent />
    </Suspense>
  );
}
