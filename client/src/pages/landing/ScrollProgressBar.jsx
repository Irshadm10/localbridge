import { useScrollProgress } from './landingHooks';

export default function ScrollProgressBar() {
  const progress = useScrollProgress();

  return (
    <div aria-hidden className="fixed left-0 right-0 top-0 z-[9998] h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shadow-[0_0_18px_rgba(234,88,12,.65)]"
        style={{ width: `${progress * 100}%`, transition: 'width 90ms linear' }}
      />
    </div>
  );
}
