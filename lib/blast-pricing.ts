/** Tiered blast pricing per the spec */
export function calcBlastPrice(count: number): number {
  if (count <= 1000)  return 60;
  if (count <= 2000)  return 85;
  if (count <= 3000)  return 115;
  if (count <= 5000)  return 300;
  if (count <= 10000) return 600;
  // $600 + $110 per additional 1,000 above 10,000
  const extra = Math.ceil((count - 10000) / 1000);
  return 600 + extra * 110;
}

export const BLAST_TIERS = [
  { label: "Up to 1,000 members",  price: 60  },
  { label: "Up to 2,000 members",  price: 85  },
  { label: "Up to 3,000 members",  price: 115 },
  { label: "Up to 5,000 members",  price: 300 },
  { label: "Up to 10,000 members", price: 600 },
  { label: "10,000+ members",      price: null }, // dynamic
];

export const BLAST_LIMIT_PER_MONTH = 2;
