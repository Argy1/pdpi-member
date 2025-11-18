import { BookOpen } from 'lucide-react';

interface BankDataHeroProps {
  totalEbooks: number;
}

export const BankDataHero = ({ totalEbooks }: BankDataHeroProps) => {
  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b">
      <div className="container-pdpi py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold heading-medical text-foreground leading-tight">
              Bank Data PDPI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Kumpulan e-book, pedoman, dan dokumen resmi PDPI bagi anggota
            </p>
            <div className="flex items-center gap-3 text-foreground/80">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm md:text-base font-medium">
                Total e-book: <span className="text-primary font-semibold">{totalEbooks}</span>
              </span>
            </div>
          </div>

          {/* Illustration */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 p-12 md:p-16 rounded-3xl">
                <BookOpen className="h-32 w-32 md:h-40 md:w-40 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
