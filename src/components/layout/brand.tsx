import Image from "next/image";
import { hasOfficialLogo } from "@/lib/brand";

export function Brand({ preload = false }: { preload?: boolean }) {
  return hasOfficialLogo() ? (
    <Image src="/brand/yummi-sushi-logo.webp" alt="Yummi Sushi Delivery" width={1254} height={1254} className="h-16 w-16 shrink-0 rounded-xl bg-white p-1 object-contain sm:h-20 sm:w-20" preload={preload} />
  ) : (
    <span className="text-base font-semibold tracking-wide">Yummi Sushi Delivery</span>
  );
}
