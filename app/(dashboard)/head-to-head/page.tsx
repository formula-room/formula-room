import type { Metadata } from "next";

import { HeadToHeadPageView } from "@/components/head-to-head/head-to-head-page";

export const metadata: Metadata = {
  title: "Head-to-Head",
};

export default function HeadToHeadPage() {
  return <HeadToHeadPageView />;
}
