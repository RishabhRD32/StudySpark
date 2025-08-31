
"use client"

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { usePublicMaterials } from "@/hooks/use-firestore";

export function PublicSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const { materials, loading } = usePublicMaterials(searchTerm);

  return (
    <section id="search" className="container py-24 sm:py-32">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Search for{" "}
          <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
            Public Study Materials
          </span>
        </h2>
        <p className="mt-4 mb-8 text-xl text-muted-foreground">
          Explore notes and resources shared by other students.
        </p>

        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title or subject..."
              className="w-full pl-10 text-lg py-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
             <div className="col-span-full flex justify-center items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin"/>
                <span>Searching...</span>
             </div>
          ) : materials.length > 0 ? (
            materials.map(material => (
              <Card key={material.id} className="text-left">
                <CardHeader>
                    {material.contentType === 'link' ? (
                        <a href={material.content} target="_blank" rel="noopener noreferrer">
                            <CardTitle className="hover:text-primary hover:underline">{material.title}</CardTitle>
                        </a>
                    ) : (
                         <CardTitle>{material.title}</CardTitle>
                    )}
                  
                  <CardDescription>Subject: {material.subjectTitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Uploaded by: {material.uploaderName || "Anonymous"}</p>
                </CardContent>
              </Card>
            ))
          ) : (
             searchTerm && <p className="col-span-full text-muted-foreground">No public materials found for "{searchTerm}".</p>
          )}
        </div>
      </div>
    </section>
  );
}
