
"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function NewsPage() {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Daily News</h1>
            <p className="text-muted-foreground">Your daily briefing from Google News India.</p>
          </div>
      </div>

      <Card className="flex-grow">
        <CardContent className="p-0 h-full">
            <iframe
                src="https://news.google.com/home?hl=en-IN&gl=IN&ceid=IN%3Aen"
                className="w-full h-full border-0 rounded-lg"
                title="Google News India"
                sandbox="allow-scripts allow-same-origin allow-popups"
            ></iframe>
        </CardContent>
      </Card>
    </div>
  );
}
