"use client";

import { useState } from "react";

const HEADER_IMAGES = [
  "/images/fairway.jpg",
  "/images/sunset-drive.jpg",
  "/images/golden-fairway.jpg",
  "/images/dawn-mist.jpg",
  "/images/waterhole.jpg",
  "/images/green-flag.jpg",
  "/images/summer-tee.jpg",
];

export default function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const [img] = useState(() => HEADER_IMAGES[Math.floor(Math.random() * HEADER_IMAGES.length)]);

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
      <div className="absolute inset-0 bg-white/65" />
      <div className="relative px-4 py-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-navy">{title}</h2>
        {children && <div className="flex gap-2 items-center">{children}</div>}
      </div>
    </div>
  );
}
