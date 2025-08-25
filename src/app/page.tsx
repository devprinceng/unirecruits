import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { recruitments } from "@/lib/data";
import { ArrowRight, Briefcase, MapPin, University } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const latestRecruitments = recruitments.slice(0, 3);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Shape the Future of Academia with UniRecruits
                </h1>
                <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                  Discover rewarding career opportunities and grow with our esteemed university. Your journey starts here.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="#latest-jobs">
                    View Open Positions
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              width="600"
              height="400"
              alt="Hero"
              data-ai-hint="university campus"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            />
          </div>
        </div>
      </section>

      <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">About Us</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Fostering Excellence in Education</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We are a leading institution dedicated to academic excellence, innovative research, and community engagement. Our faculty and staff are the cornerstones of our success, and we are committed to providing a supportive and dynamic work environment.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <Image
              src="https://placehold.co/600x400.png"
              width="600"
              height="400"
              alt="About"
              data-ai-hint="library students"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
            />
            <div className="flex flex-col justify-center space-y-4">
              <ul className="grid gap-6">
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Our Mission</h3>
                    <p className="text-muted-foreground">
                      To advance knowledge and educate students in science, technology, and other areas of scholarship that will best serve the nation and the world.
                    </p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Our Vision</h3>
                    <p className="text-muted-foreground">
                      To be a global leader in education, research, and innovation, making a profound impact on the challenges of our time.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="latest-jobs" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm">Latest Jobs</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join Our Team</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Explore our latest job openings and find your place at our university.
              </p>
            </div>
          </div>
          <div className="mx-auto grid gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3 mt-12">
            {latestRecruitments.map((job) => (
              <Card key={job.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription className="flex items-center pt-1">
                    <University className="mr-2 h-4 w-4" /> {job.department}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                   <div className="text-sm text-muted-foreground">
                     Closing: {job.closingDate}
                   </div>
                  <Button asChild variant="default">
                    <Link href={`/recruitments/${job.id}`}>
                      Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
