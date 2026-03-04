import fmIcon from '../assets/fm.png';

export default function CampusRadio({ lang }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <img
        src={fmIcon}
        alt="Campus Radio"
        className="w-16 h-16 mb-6 object-contain"
      />
      <h1 className="text-3xl font-black mb-3 text-foreground">Campus Radio</h1>
      <p className="text-muted-foreground text-lg mb-2">
        {lang === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon'}
      </p>
      <p className="text-muted-foreground text-sm max-w-md">
        {lang === 'bn'
          ? 'ক্যাম্পাস রেডিও শীঘ্রই চালু হবে। আমাদের সাথে থাকুন।'
          : 'Campus Radio is on its way. Stay tuned for updates.'}
      </p>
    </div>
  );
}
