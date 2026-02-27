export default function New({ lang }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold text-foreground">
        {lang === 'en' ? 'Coming Soon' : 'শীঘ্রই আসছে'}
      </h1>
    </div>
  );
}
