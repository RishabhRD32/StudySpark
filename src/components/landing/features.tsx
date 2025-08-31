import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, BookOpen, CalendarDays, ListTodo, Newspaper, Zap } from "lucide-react";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <BrainCircuit />,
    title: "AI Tutor",
    description: "Stuck on a problem? Get instant, step-by-step guidance from your personal AI tutor.",
  },
  {
    icon: <Zap />,
    title: "AI Summarizer",
    description: "Condense long articles and documents into key points, saving you time and effort.",
  },
  {
    icon: <BookOpen />,
    title: "Subjects Management",
    description: "Organize all your courses, assignments, and study materials in one central place.",
  },
  {
    icon: <CalendarDays />,
    title: "Interactive Calendar",
    description: "Never miss a deadline again with a clear view of all your upcoming assignments.",
  },
  {
    icon: <ListTodo />,
    title: "Study Planner",
    description: "Create and manage your study schedule to stay on track and achieve your goals.",
  },
  {
    icon: <Newspaper />,
    title: "Daily News",
    description: "Stay informed with curated news articles relevant to your fields of study.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="container py-24 sm:py-32 space-y-8">
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Many{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Powerful Features
        </span>
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ icon, title, description }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-full">{icon}</div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              {description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
