import type { Metadata } from "next";

import { CircuitProfilePageView } from "@/components/circuit/circuit-profile-page";

type CircuitPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CircuitPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | Circuit Profile`,
  };
}

export default async function CircuitPage({ params }: CircuitPageProps) {
  const { slug } = await params;
  return <CircuitProfilePageView slug={slug} />;
}
