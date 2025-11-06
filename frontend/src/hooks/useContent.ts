import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  fetchNiches,
  createNiche,
  updateNiche,
  deleteNiche,
} from "@/lib/api/content";
import { toast } from "sonner";

// Query keys
export const contentKeys = {
  all: ["content"] as const,
  industries: (skip?: number, limit?: number) =>
    [...contentKeys.all, "industries", skip, limit] as const,
  niches: (skip?: number, limit?: number, industryId?: string) =>
    [...contentKeys.all, "niches", skip, limit, industryId] as const,
};

/**
 * Hook to fetch industries
 */
export const useIndustries = (skip: number = 0, limit: number = 100) => {
  return useQuery({
    queryKey: contentKeys.industries(skip, limit),
    queryFn: () => fetchIndustries(skip, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

/**
 * Hook to create industry
 */
export const useCreateIndustry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createIndustry(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      toast.success("Industry created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create industry");
    },
  });
};

/**
 * Hook to update industry
 */
export const useUpdateIndustry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateIndustry(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      toast.success("Industry updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update industry");
    },
  });
};

/**
 * Hook to delete industry
 */
export const useDeleteIndustry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIndustry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      toast.success("Industry deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete industry");
    },
  });
};

/**
 * Hook to fetch niches
 */
export const useNiches = (
  skip: number = 0,
  limit: number = 100,
  industryId?: string
) => {
  return useQuery({
    queryKey: contentKeys.niches(skip, limit, industryId),
    queryFn: () => fetchNiches(skip, limit, industryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

/**
 * Hook to create niche
 */
export const useCreateNiche = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, industryId }: { name: string; industryId: string }) =>
      createNiche(name, industryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      toast.success("Niche created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create niche");
    },
  });
};

/**
 * Hook to update niche
 */
export const useUpdateNiche = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      industryId,
    }: {
      id: string;
      name: string;
      industryId?: string;
    }) => updateNiche(id, name, industryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      toast.success("Niche updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update niche");
    },
  });
};

/**
 * Hook to delete niche
 */
export const useDeleteNiche = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNiche(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      toast.success("Niche deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete niche");
    },
  });
};
