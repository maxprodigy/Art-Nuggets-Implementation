"use client";

import React, { useState } from "react";
import {
  useIndustries,
  useCreateIndustry,
  useUpdateIndustry,
  useDeleteIndustry,
} from "@/hooks/useContent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function IndustriesManagementPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useIndustries();
  const createMutation = useCreateIndustry();
  const updateMutation = useUpdateIndustry();
  const deleteMutation = useDeleteIndustry();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    createMutation.mutate(name, {
      onSuccess: () => {
        setIsCreateOpen(false);
        (e.target as HTMLFormElement).reset();
      },
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingIndustry) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    updateMutation.mutate(
      { id: editingIndustry.id, name },
      {
        onSuccess: () => {
          setEditingIndustry(null);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading industries...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Industries Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage industries in the platform
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Industry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Industry</DialogTitle>
                <DialogDescription>
                  Add a new industry to the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Industry Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter industry name"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {data?.total
              ? `${data.total} industr${data.total !== 1 ? "ies" : "y"}`
              : "Industries"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.industries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No industries found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.industries.map((industry) => (
                  <TableRow key={industry.id}>
                    <TableCell className="font-medium">
                      {industry.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog
                          open={editingIndustry?.id === industry.id}
                          onOpenChange={(open) =>
                            !open && setEditingIndustry(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setEditingIndustry({
                                  id: industry.id,
                                  name: industry.name,
                                })
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <form onSubmit={handleUpdate}>
                              <DialogHeader>
                                <DialogTitle>Edit Industry</DialogTitle>
                                <DialogDescription>
                                  Update the industry name.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">
                                    Industry Name
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    name="name"
                                    defaultValue={editingIndustry?.name}
                                    required
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingIndustry(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="submit"
                                  disabled={updateMutation.isPending}
                                >
                                  {updateMutation.isPending
                                    ? "Updating..."
                                    : "Update"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Dialog
                          open={deleteConfirm === industry.id}
                          onOpenChange={(open) =>
                            !open && setDeleteConfirm(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(industry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Industry</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{industry.name}
                                "? This action cannot be undone. The industry
                                cannot be deleted if it has associated niches,
                                courses, or users.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(industry.id)}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending
                                  ? "Deleting..."
                                  : "Delete"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
