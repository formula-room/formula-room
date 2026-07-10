import type { Metadata } from "next";

import { DriverProfilePageView } from "@/components/driver/driver-profile-page";

type DriverPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DriverPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | Driver Profile`,
  };
}

export default async function DriverPage({ params }: DriverPageProps) {
  const { slug } = await params;
  return <DriverProfilePageView slug={slug} />;
}
