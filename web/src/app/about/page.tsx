import type { Metadata } from "next";
import AboutView from "@/components/views/AboutView";

export const metadata: Metadata = {
  title: "About — Linda Xue",
};

export default function Page() {
  return <AboutView />;
}
