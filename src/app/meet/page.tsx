import { Metadata } from "next";
import { CalEmbed } from "./_embed";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function MeetPage() {
  return <CalEmbed />;
}
