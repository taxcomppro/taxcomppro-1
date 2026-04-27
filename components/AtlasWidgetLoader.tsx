"use client";
import dynamic from "next/dynamic";

const AtlasWidget = dynamic(() => import("./AtlasWidget"), { ssr: false });

export default function AtlasWidgetLoader() {
  return <AtlasWidget />;
}
