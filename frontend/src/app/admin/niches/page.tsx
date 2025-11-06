"use client";

import React, { useState } from "react";
import {
  useNiches,
  useCreateNiche,
  useUpdateNiche,
  useDeleteNiche,
} from "@/hooks/useContent";
import { useIndustries } from "@/hooks/useContent";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function NichesManagementPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>("all");
  const [createIndustryId, setCreateIndustryId] = useState<string>("");
  const [editingNiche, setEditingNiche] = useState<{
    id: string;
    name: string;
    industry_id: string;
  } | null>(null);
  const [editIndustryId, setEditIndustryId] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: industriesData } = useIndustries();
  const { data, isLoading } = useNiches(
    0,
    100,
    selectedIndustryId && selectedIndustryId !== "all"
      ? selectedIndustryId
      : undefined
  );
  const createMutation = useCreateNiche();
  const updateMutation = useUpdateNiche();
  const deleteMutation = useDeleteNiche();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (!createIndustryId) {
      toast.error("Please select an industry");
      return;
    }

    createMutation.mutate(
      { name, industryId: createIndustryId },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setCreateIndustryId("");
          (e.target as HTMLFormElement).reset();
        },
      }
    );
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingNiche) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    updateMutation.mutate(
      {
        id: editingNiche.id,
        name,
        industryId: editIndustryId || editingNiche.industry_id,
      },
      {
        onSuccess: () => {
          setEditingNiche(null);
          setEditIndustryId("");
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

  const getIndustryName = (industryId: string) => {
    return (
      industriesData?.industries.find((i) => i.id === industryId)?.name ||
      "Unknown"
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading niches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Niches Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage niches in the platform
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Niche
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New Niche</DialogTitle>
                <DialogDescription>
                  Add a new niche to an industry.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-name">Niche Name</Label>
                  <Input
                    id="create-name"
                    name="name"
                    placeholder="Enter niche name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-industry">Industry</Label>
                  <Select
                    value={createIndustryId}
                    onValueChange={setCreateIndustryId}
                    required
                  >
                    <SelectTrigger id="create-industry">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industriesData?.industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

      {/* Filter by Industry */}
      <div className="flex items-center gap-4">
        <Label htmlFor="filter-industry">Filter by Industry:</Label>
        <Select
          value={selectedIndustryId}
          onValueChange={setSelectedIndustryId}
        >
          <SelectTrigger id="filter-industry" className="w-[250px]">
            <SelectValue placeholder="All industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {industriesData?.industries.map((industry) => (
              <SelectItem key={industry.id} value={industry.id}>
                {industry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {data?.total
              ? `${data.total} niche${data.total !== 1 ? "s" : ""}`
              : "Niches"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.niches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No niches found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.niches.map((niche) => (
                  <TableRow key={niche.id}>
                    <TableCell className="font-medium">{niche.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getIndustryName(niche.industry_id)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog
                          open={editingNiche?.id === niche.id}
                          onOpenChange={(open) =>
                            !open && setEditingNiche(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingNiche({
                                  id: niche.id,
                                  name: niche.name,
                                  industry_id: niche.industry_id,
                                });
                                setEditIndustryId(niche.industry_id);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <form onSubmit={handleUpdate}>
                              <DialogHeader>
                                <DialogTitle>Edit Niche</DialogTitle>
                                <DialogDescription>
                                  Update the niche name and industry.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-name">Niche Name</Label>
                                  <Input
                                    id="edit-name"
                                    name="name"
                                    defaultValue={editingNiche?.name}
                                    required
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-industry">
                                    Industry
                                  </Label>
                                  <Select
                                    value={
                                      editIndustryId ||
                                      editingNiche?.industry_id
                                    }
                                    onValueChange={setEditIndustryId}
                                    required
                                  >
                                    <SelectTrigger id="edit-industry">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {industriesData?.industries.map(
                                        (industry) => (
                                          <SelectItem
                                            key={industry.id}
                                            value={industry.id}
                                          >
                                            {industry.name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditingNiche(null)}
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
                          open={deleteConfirm === niche.id}
                          onOpenChange={(open) =>
                            !open && setDeleteConfirm(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(niche.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Niche</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{niche.name}"?
                                This action cannot be undone. The niche cannot
                                be deleted if it has associated courses or
                                users.
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
                                onClick={() => handleDelete(niche.id)}
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
