"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProviderProfile } from "@/types";

interface ProviderPreviewCardProps {
  provider: ProviderProfile;
  distance?: string;
}

export function ProviderPreviewCard({ provider, distance }: ProviderPreviewCardProps) {
  return (
    <Card className="flex flex-col sm:flex-row overflow-hidden shadow-elegant border-border/50 animate-fade-in group">
      <div className="relative w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden">
        {provider.profileImage ? (
          <Image 
            src={provider.profileImage} 
            alt={provider.businessName}
            fill
            className="object-cover group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center text-primary/40">
            <MapPin className="h-8 w-8" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="glass text-[10px] py-0 px-1.5 border-none shadow-sm">
            {provider.profession}
          </Badge>
        </div>
      </div>

      <div className="flex-grow p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {provider.businessName}
            </h4>
            <div className="flex items-center gap-0.5 text-accent font-bold text-xs shrink-0">
              <Star className="h-3 w-3 fill-accent" />
              {provider.averageRating.toFixed(1)}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {distance ? `${distance} km away` : provider.location.city}
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              Open now · Closes 6:00 PM
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs font-bold text-primary">
            <Link href={`/providers/${provider.id}`}>
              View profile
            </Link>
          </Button>
          <Button asChild size="sm" className="h-7 rounded-md px-3 text-[10px] font-bold">
            <Link href={`/providers/${provider.id}/book`}>
              Book <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
