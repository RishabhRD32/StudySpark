import Image from "next/image";

export function About() {
  return (
    <section id="about" className="container py-24 sm:py-32">
      <div className="bg-muted/50 border rounded-lg py-12">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
          <Image 
            src="https://picsum.photos/600/400" 
            alt="Students collaborating" 
            width={600} 
            height={400} 
            className="w-full md:w-1/2 rounded-lg object-cover"
            data-ai-hint="students collaborating"
          />
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                About{" "}
              </span>
              StudySpark
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              At StudySpark, our mission is to empower students by providing an intelligent, all-in-one platform that simplifies learning and boosts productivity. We believe that with the right tools, every student can unlock their full academic potential.
            </p>
            <p className="mt-4 text-muted-foreground">
              Born from the idea of making education more accessible and personalized, StudySpark integrates cutting-edge AI to offer smart assistance, from an AI tutor that clarifies complex topics to a summarizer that condenses lengthy texts. Our vision is to create a future where learning is not a chore, but an engaging and rewarding experience for everyone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
