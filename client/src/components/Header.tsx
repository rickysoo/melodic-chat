import MelodicLogo from "./MelodicLogo";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <MelodicLogo size={32} />
        <h1 className="font-heading font-bold text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-500">
          Melodic
        </h1>
      </div>
    </header>
  );
}
