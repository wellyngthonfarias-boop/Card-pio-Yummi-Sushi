"use client";
import { useCatalog } from "@/components/catalog-provider";
export function OpeningHours() { return <>{useCatalog().hours}</>; }
