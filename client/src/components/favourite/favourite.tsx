"use client";

import { Sidebar } from "@/components/layout/SideBar";
import { Header } from "@/components/layout/Header";
import { CardComponent } from "@/components/campaign-creation/DynamicCard";
import { useState, useEffect } from "react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import CreateCampaign from "@/components/campaign-creation/Dialouges";
import { favoriteCampaign, getFavouriteCampaigns } from "@/api/campaign/api";
import { Campaign } from "@/types/campaign";
import { useRouter } from "next/navigation";
import { getApplicants } from "@/api/cv/api";

export default function   Favourite() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applicantsCount, setApplicantsCount] = useState<Record<string, number>>({});

  const fetchCampaigns = () => {
    setIsLoading(true);
    getFavouriteCampaigns(true)
      .then(async (campaigns) => {
        setCampaigns(campaigns);
        // Fetch applicants for each campaign
        const counts: Record<string, number> = {};
        await Promise.all(
          campaigns.map(async (campaign) => {
            if (campaign.id) {
              try {
                const applicants = await getApplicants(campaign.id);
                counts[campaign.id] = applicants.length;
              } catch (error) {
                console.error(`Error fetching applicants for campaign ${campaign.id}:`, error);
                counts[campaign.id] = 0;
              }
            }
          })
        );
        setApplicantsCount(counts);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);


  return (
    <div className="w-full bg-muted/20">
      <div className="max-w-[1440px] mx-auto flex px-0 lg:px-6 lg:pt-6 pt-2">
        <div className="border-[#E4E4E7] border-[1px] shadow-md rounded-[6px] h-screen">
          <Sidebar
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <MobileHeader
            button={false}
            onMobileMenuClick={() => setIsMobileOpen(true)}
            title="Your Campaigns"
            onAddClick={() => setDialogOpen(true)}
          />

          <Header
            title="Your Campaigns"
            subtitle="Welcome, Moiz"
            user={{ name: "Abdul Moiz", avatarUrl: "" }}
          />

          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {isLoading ? (
                // Show 6 skeleton cards while loading
                Array.from({ length: 6 }).map((_, idx) => (
                  <CardComponent
                    key={`skeleton-${idx}`}
                    variant="skeleton"
                  />
                ))
              ) : campaigns.length === 0 ? (
                <div className="col-span-full flex justify-center items-center h-40 text-muted-foreground text-lg">
                  Favourite is empty...
                </div>
              ) : (
                campaigns.map((campaign) => {
                  let status: "ongoing" | "completed" | "archived" | undefined = undefined;
                  if (campaign.status === "ongoing" || campaign.status === "completed" || campaign.status === "archived") {
                    status = campaign.status;
                  }
                  return (
                    <CardComponent
                      key={campaign.id}
                      title={campaign.name}
                      status={status}
                      username={campaign.company_name}
                      count={applicantsCount[campaign.id || ''] || 0}
                      isFavorite={campaign.is_favorite}
                      onClick={() => router.push(`/campaign/${campaign.id}`)}
                      onFavorite={async () => {
                        if (!campaign.id) return;
                        await favoriteCampaign(String(campaign.id), !campaign.is_favorite);
                        fetchCampaigns();
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
