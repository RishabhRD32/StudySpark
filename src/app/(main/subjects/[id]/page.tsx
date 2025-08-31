
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubject, useAssignments, useStudyMaterials } from "@/hooks/use-firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, MoreVertical, PlusCircle, Trash2, Edit, CalendarIcon } from "lucide-react";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Assignment, StudyMaterial } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth/use-auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
  status: z.enum(["Pending", "Completed"]),
});

const materialSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(["Notes", "Practicals", "PYQ"]),
    contentType: z.enum(["link", "text"]),
    content: z.string().min(1, "Content is required"),
    isPublic: z.boolean().default(false),
});

export default function SubjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { userProfile } = useAuth();
  const { subject, loading: subjectLoading } = useSubject(id);
  const { assignments, loading: assignmentsLoading, addAssignment, updateAssignment, deleteAssignment } = useAssignments(id);
  const { materials, loading: materialsLoading, addMaterial, deleteMaterial } = useStudyMaterials(id);
  const { toast } = useToast();

  const [isAssignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [isMaterialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const assignmentForm = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { title: "", status: "Pending" },
  });

  const materialForm = useForm<z.infer<typeof materialSchema>>({
    resolver: zodResolver(materialSchema),
    defaultValues: { title: "", type: "Notes", contentType: "link", content: "", isPublic: false },
  });

  const handleOpenAssignmentModal = (assignment: Assignment | null = null) => {
    setEditingAssignment(assignment);
    if (assignment) {
      assignmentForm.reset({
        title: assignment.title,
        dueDate: new Date(assignment.dueDate),
        status: assignment.status,
      });
    } else {
      assignmentForm.reset({ title: "", dueDate: undefined, status: "Pending" });
    }
    setAssignmentModalOpen(true);
  };
  
  const handleAssignmentSubmit = async (values: z.infer<typeof assignmentSchema>) => {
    try {
      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, { ...values, dueDate: values.dueDate.toISOString() });
        toast({ title: "Success", description: "Assignment updated successfully." });
      } else {
        await addAssignment({ ...values, subjectId: id, dueDate: values.dueDate.toISOString(), grade: null });
        toast({ title: "Success", description: "Assignment added successfully." });
      }
      setAssignmentModalOpen(false);
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not save assignment." });
    }
  };

  const handleMaterialSubmit = async (values: z.infer<typeof materialSchema>) => {
      try {
          const uploaderName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Anonymous";
          await addMaterial({ ...values, uploaderName, subjectId: id });
          toast({ title: "Success", description: "Study material added." });
          setMaterialModalOpen(false);
          materialForm.reset();
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Could not add material." });
      }
  };

  if (subjectLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <div className="grid gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
  }

  if (!subject) {
      return (
          <div className="text-center">
              <h2 className="text-2xl font-bold">Subject not found</h2>
              <p className="text-muted-foreground">This subject may have been deleted or you don't have access.</p>
          </div>
      )
  }

  const renderMaterial = (material: StudyMaterial) => {
    if (material.contentType === 'link') {
      return <a href={material.content} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{material.title}</a>;
    }
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-left text-primary hover:underline">{material.title}</button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{material.title}</DialogTitle>
                </DialogHeader>
                <div className="prose dark:prose-invert max-h-[60vh] overflow-y-auto">
                    <p>{material.content}</p>
                </div>
            </DialogContent>
        </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{subject.title}</h1>
        <p className="text-muted-foreground">{subject.instructor}</p>
      </div>

      <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Assignments</CardTitle>
              <Button size="sm" onClick={() => handleOpenAssignmentModal()}>
                  <PlusCircle className="mr-2 h-4 w-4"/>
                  Add Assignment
              </Button>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? <Loader2 className="animate-spin mx-auto"/> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No assignments yet.</TableCell>
                    </TableRow>
                  ) : assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.status === "Completed" ? "secondary" : "outline"}>
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenAssignmentModal(assignment)}>
                                      <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                                          </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                          <AlertDialogHeader>
                                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                  This will permanently delete the assignment "{assignment.title}". This action cannot be undone.
                                              </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => deleteAssignment(assignment.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                          </AlertDialogFooter>
                                      </AlertDialogContent>
                                  </AlertDialog>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>

          <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>Study Materials</CardTitle>
                   <Button size="sm" onClick={() => setMaterialModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Material
                    </Button>
              </CardHeader>
              <CardContent>
                  {materialsLoading ? <Loader2 className="animate-spin mx-auto"/> : (
                  <Accordion type="multiple">
                      <AccordionItem value="notes">
                          <AccordionTrigger>Notes</AccordionTrigger>
                          <AccordionContent>
                              <ul className="space-y-2">
                                  {materials.filter(m => m.type === 'Notes').length === 0 ? <p className="text-muted-foreground">No notes added.</p> : materials.filter(m => m.type === 'Notes').map(m => (
                                      <li key={m.id} className="flex justify-between items-center group">
                                          {renderMaterial(m)}
                                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteMaterial(m.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                      </li>
                                  ))}
                              </ul>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="practicals">
                          <AccordionTrigger>Practicals</AccordionTrigger>
                          <AccordionContent>
                               <ul className="space-y-2">
                                  {materials.filter(m => m.type === 'Practicals').length === 0 ? <p className="text-muted-foreground">No practicals added.</p> : materials.filter(m => m.type === 'Practicals').map(m => (
                                       <li key={m.id} className="flex justify-between items-center group">
                                           {renderMaterial(m)}
                                           <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteMaterial(m.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                      </li>
                                  ))}
                              </ul>
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="pyq">
                          <AccordionTrigger>Previous Year Question Papers (PYQ)</AccordionTrigger>
                          <AccordionContent>
                               <ul className="space-y-2">
                                  {materials.filter(m => m.type === 'PYQ').length === 0 ? <p className="text-muted-foreground">No PYQs added.</p> : materials.filter(m => m.type === 'PYQ').map(m => (
                                      <li key={m.id} className="flex justify-between items-center group">
                                          {renderMaterial(m)}
                                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteMaterial(m.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                      </li>
                                  ))}
                              </ul>
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
                  )}
              </CardContent>
          </Card>
        </div>

        {/* Add/Edit Assignment Modal */}
        <Dialog open={isAssignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
            <DialogContent>
                 <Form {...assignmentForm}>
                    <form onSubmit={assignmentForm.handleSubmit(handleAssignmentSubmit)}>
                        <DialogHeader>
                            <DialogTitle>{editingAssignment ? 'Edit' : 'Add'} Assignment</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <FormField control={assignmentForm.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField
                              control={assignmentForm.control}
                              name="dueDate"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Due Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant={"outline"}
                                          className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                          )}
                                        >
                                          {field.value ? (
                                            format(field.value, "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                          date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField control={assignmentForm.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel>Status</FormLabel>
                                    <FormControl>
                                    <select {...field} className="w-full p-2 border rounded-md bg-background">
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setAssignmentModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={assignmentForm.formState.isSubmitting}>
                                {assignmentForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>

        {/* Add Material Modal */}
        <Dialog open={isMaterialModalOpen} onOpenChange={setMaterialModalOpen}>
            <DialogContent>
                <Form {...materialForm}>
                    <form onSubmit={materialForm.handleSubmit(handleMaterialSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Add Study Material</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <FormField control={materialForm.control} name="title" render={({ field }) => (
                                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={materialForm.control} name="type" render={({ field }) => (
                                <FormItem><FormLabel>Category</FormLabel>
                                <FormControl>
                                <select {...field} className="w-full p-2 border rounded-md bg-background">
                                    <option value="Notes">Notes</option>
                                    <option value="Practicals">Practicals</option>
                                    <option value="PYQ">PYQ</option>
                                </select>
                                </FormControl>
                                <FormMessage /></FormItem>
                            )}/>
                             <FormField control={materialForm.control} name="contentType" render={({ field }) => (
                                <FormItem><FormLabel>Content Type</FormLabel>
                                 <FormControl>
                                 <select {...field} className="w-full p-2 border rounded-md bg-background">
                                    <option value="link">Link</option>
                                    <option value="text">Text</option>
                                </select>
                                </FormControl>
                                <FormMessage /></FormItem>
                            )}/>
                            <FormField control={materialForm.control} name="content" render={({ field }) => (
                                <FormItem>
                                <FormLabel>{materialForm.watch('contentType') === 'link' ? 'URL' : 'Content'}</FormLabel>
                                <FormControl>
                                    {materialForm.watch('contentType') === 'link' ? 
                                    <Input {...field} placeholder="https://..."/> :
                                    <Textarea {...field} placeholder="Enter your notes..." rows={10}/>
                                    }
                                </FormControl>
                                <FormMessage /></FormItem>
                            )}/>
                             <FormField
                                control={materialForm.control}
                                name="isPublic"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                        Make this material public?
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                        If checked, this material will be searchable on the landing page by anyone.
                                        </p>
                                    </div>
                                    </FormItem>
                                )}
                                />
                        </div>
                        <DialogFooter>
                           <Button type="button" variant="ghost" onClick={() => setMaterialModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={materialForm.formState.isSubmitting}>
                                {materialForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Material
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  );
}

    