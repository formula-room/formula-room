import type { Metadata } from "next";

import { TeamProfilePageView } from "@/components/team/team-profile-page";

type TeamPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | Team Profile`,
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;
  return <TeamProfilePageView slug={slug} />;
}
