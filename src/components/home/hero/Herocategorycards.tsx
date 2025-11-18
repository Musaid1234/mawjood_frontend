'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface HeroCard {
  id: string;
  title: string;
  buttonText: string;
  buttonColor: string;
  bgImage: string;
  slug: string;
}

interface HeroCategoryCardsProps {
  cards: HeroCard[];
  locationSlug: string;
  loading?: boolean;
}

export default function HeroCategoryCards({ cards, locationSlug, loading }: HeroCategoryCardsProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`hero-skeleton-${idx}`}
            className="h-40 rounded-xl bg-white shadow-lg border border-gray-100 p-6 flex flex-col justify-between animate-pulse"
          >
            <div className="h-5 w-3/4 bg-gray-200 rounded-full" />
            <div className="h-8 w-32 bg-gray-200 rounded-md self-start" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => router.push(`/${locationSlug}/${card.slug}`)}
          className="bg-blue-100 rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform flex h-40 cursor-pointer hover:scale-105"
        >
          <div className="flex-1 p-6 flex flex-col justify-between">
            <h3 className="text-md font-bold text-gray-800 mb-3">{card.title}</h3>
            <button
              className={`${card.buttonColor} text-white font-bold py-2 px-4 rounded-sm hover:opacity-90 transition-all duration-300 text-xs uppercase tracking-wide w-fit`}
            >
              {card.buttonText}
            </button>
          </div>
          <div className="w-32 relative">
            <Image src={card.bgImage} alt={card.title} fill className="object-cover" sizes="128px" />
          </div>
        </div>
      ))}
    </div>
  );
}