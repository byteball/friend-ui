import { Handshake, Wallet } from "lucide-react";

const PartnershipWidget = () => {
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-center gap-4 md:gap-8">
        {/* Left Wallet */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="relative w-16 h-16 md:w-20 md:h-20 backdrop-blur-xl bg-gradient-to-br from-surface-elevated/80 to-surface/60 rounded-2xl flex items-center justify-center border border-border/30 shadow-2xl group-hover:border-primary/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-foreground/5 to-transparent" />
              <Wallet className="relative w-10 h-10 md:w-12 md:h-12 text-foreground/70 group-hover:text-foreground transition-colors duration-300" strokeWidth={1.5} />
            </div>
          </div>

          <span className="px-4 py-1.5 bg-green-800/10 border border-green-800/30 rounded-full text-green-800 font-bold text-lg md:text-xl">
            +1%
          </span>
        </div>

        {/* Handshake Center */}
        <div className="relative">
          <div className="relative w-24 h-24 md:w-30 md:h-30">
            <div className="absolute inset-0 rounded-full border border-primary/20" />
            <div className="absolute inset-2 rounded-full border border-primary/10" />

            <div className="absolute inset-4 backdrop-blur-xl bg-gradient-to-br from-surface-elevated/90 via-surface/70 to-surface-elevated/50 rounded-full flex items-center justify-center border border-border/20 shadow-2xl">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-foreground/10 via-transparent to-foreground/5" />
              <Handshake className="relative w-14 h-14 md:w-16 md:h-16 text-foreground" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Right Wallet */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="relative w-16 h-16 md:w-20 md:h-20 backdrop-blur-xl bg-gradient-to-br from-surface-elevated/80 to-surface/60 rounded-2xl flex items-center justify-center border border-border/30 shadow-2xl group-hover:border-primary/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-foreground/5 to-transparent" />
              <Wallet className="relative w-10 h-10 md:w-12 md:h-12 text-foreground/70 group-hover:text-foreground transition-colors duration-300" strokeWidth={1.5} />
            </div>
          </div>

          <span className="px-4 py-1.5 bg-green-800/10 border border-green-800/30 rounded-full text-green-800 font-bold text-lg md:text-xl">
            +1%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PartnershipWidget;
