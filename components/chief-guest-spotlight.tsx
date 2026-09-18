import Image from "next/image";

export default function ChiefGuestSpotlight() {
  return (
    <section id="chief-guest" className="relative w-full py-12 sm:py-16 bg-[#FAFAFC] border-y border-brand-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Flat Split Card Layout */}
        <div className="bg-white border-2 border-brand-ink/15 rounded-3xl p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Portrait Photo with Flat-Bordered Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] rounded-3xl overflow-hidden border-4 border-brand-violet bg-zinc-100 flex-shrink-0">
                <Image
                  src="/deepak-vohra.png"
                  alt="Ambassador (Dr.) Deepak Vohra"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 450px"
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            {/* Right: Guest Information & Biography */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              
              {/* Eyebrow Label */}
              <div className="mb-3">
                <span className="inline-block px-3.5 py-1 rounded-full bg-brand-violet/10 text-brand-violet text-xs font-black uppercase tracking-widest">
                  CHIEF GUEST
                </span>
              </div>

              {/* Name */}
              <h2 className="font-display text-xl sm:text-3xl md:text-3xl lg:text-[34px] xl:text-[40px] font-black uppercase tracking-wider text-brand-ink leading-tight mb-4 sm:whitespace-nowrap">
                Ambassador (Dr.) Deepak Vohra
              </h2>

              {/* Designation Pills */}
              <div className="flex flex-wrap items-center gap-2.5 mb-6">
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-brand-violet text-white text-xs font-black uppercase tracking-wide">
                  IFS (RETD.), 1973 BATCH
                </span>
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-brand-ink text-white text-xs font-black uppercase tracking-wide">
                  SPECIAL ADVISER TO THE PM — LESOTHO, SOUTH SUDAN & GUINEA-BISSAU
                </span>
              </div>

              {/* Bio Paragraph */}
              <p className="text-sm sm:text-base text-zinc-700 font-medium leading-relaxed">
                Ambassador (Dr.) Deepak Vohra is a retired Indian Foreign Service officer of the 1973 batch who has represented India as Ambassador to Armenia, Sudan, and Poland, and earlier served as Officer on Special Duty to the Technology Advisor to Prime Minister P.V. Narasimha Rao. He currently serves as Special Adviser to the Prime Ministers of Lesotho, South Sudan, and Guinea-Bissau, and to the Ladakh Autonomous Hill Development Councils of Leh and Kargil. Recognized for his work on development in emerging nations, he was awarded a gold medal by Armenia in 2005 and Sudan&apos;s highest civilian honour. A widely sought-after speaker at Indian universities and entrepreneurship summits, Ambassador Vohra brings decades of global diplomatic and developmental experience to Cabinet Valley 1.0.
              </p>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
