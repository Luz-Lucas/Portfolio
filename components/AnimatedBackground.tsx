"use client";

import { memo } from "react";

function AnimatedBackgroundComponent() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      {/* Minimal accent */}
      <div className="absolute top-0 left-0 w-1 h-32 bg-red-600" />
    </div>
  );
}

export const AnimatedBackground = memo(AnimatedBackgroundComponent);
