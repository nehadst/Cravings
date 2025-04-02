'use client';

interface PageBackgroundProps {
  image: string;
  children: React.ReactNode;
}

export default function PageBackground({ image, children }: PageBackgroundProps) {
  return (
    <div className="relative">
      <div 
        className="fixed inset-0 -z-10 w-screen h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${image}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 