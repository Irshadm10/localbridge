import { BRANDS } from './landingData';

export default function BrandStrip() {
  return (
    <div className="b-marq relative">
      <div className="overflow-hidden b-mask-x">
        <div className="b-ticker flex w-max gap-12 pr-12 items-center">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span
              key={i}
              className="font-display text-2xl font-black uppercase tracking-tight text-[var(--bridge-text-muted)] hover:text-orange-400 transition-colors whitespace-nowrap"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
