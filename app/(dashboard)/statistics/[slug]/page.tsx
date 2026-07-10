import type { Metadata } from "next";

import { StatisticsDetailPageView } from "@/components/statistics/statistics-detail-page";

type StatisticsDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ scope?: string; season?: string }>;
};

export async function generateMetadata({ params }: StatisticsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `${slug.replace(/-/g, " ")} | Statistics`,
  };
}

export default async function StatisticsDetailPage({
  params,
  searchParams,
}: StatisticsDetailPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  return (
    <StatisticsDetailPageView
      slug={slug}
      initialScope={query.scope === "Season" ? "Season" : "All-Time"}
      initialSeason={query.season}
    />
  );
}
