"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import JourneyListItem from "@/components/journey-list-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Mock data
const journeys = [
  {
    id: "1",
    title: "FastAPI 실무 배우기",
    progress: 69,
    href: "/app/journey/1",
    icon: "⚡",
  },
  {
    id: "2",
    title: "React Native으로 사이드 프로젝트...",
    progress: 27,
    href: "/app/journey/2",
    icon: "🔧",
  },
  {
    id: "3",
    title: "Nest.js로 백엔드 정복하기",
    progress: 75,
    href: "/app/journey/3",
    icon: "🚀",
  },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-3">
          <Link href="/app" className="text-lg font-bold">
            오마카쌤
          </Link>
        </div>
        <div className="px-4 pb-3">
          <Input type="search" placeholder="원하는 내용 검색" className="h-9" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>빌더 여정들</SidebarGroupLabel>
          <SidebarMenu>
            {journeys.map((journey) => (
              <SidebarMenuItem key={journey.id}>
                <JourneyListItem {...journey} />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <div className="px-4 py-3">
          <Link href="/app/new">
            <Button variant="outline" className="w-full">
              + 새 빌더 여정
            </Button>
          </Link>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 px-4 py-3">
          <UserButton />
          <span className="text-sm">한채은 빌더</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
