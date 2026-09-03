import Image from "next/image";

export default function EStorePage() {
  return (
    <section className="flex min-h-[75vh] flex-col items-center justify-center px-6 py-16">
      <h1 className="text-center font-display text-[120px] leading-[0.9] tracking-[1px] text-[var(--color-red)] sm:text-[168px]">
        COMING SOON!
      </h1>
      <div className="flex flex-col items-center">
        <Image
          src="/images/estore-airplanes.png"
          alt=""
          width={3000}
          height={1100}
          priority
          className="relative z-0 mb-[-17rem] h-auto w-[min(78vw,760px)] -translate-y-24 scale-[1.75]"
        />
        <Image
          src="/images/estore-drivers.png"
          alt=""
          width={3000}
          height={1100}
          priority
          className="relative z-10 h-auto w-[min(84vw,900px)] scale-110"
        />
        <Image
          src="/images/estore-cars.png"
          alt=""
          width={3000}
          height={1100}
          priority
          className="relative z-20 -mt-44 mb-[-7rem] h-auto w-[min(92vw,1100px)]"
        />
      </div>
    </section>
  );
}
