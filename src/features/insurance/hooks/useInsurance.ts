import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { insuranceService } from '../services/insurance.service';
import type {
  CreateInsuranceMemberDto,
  CreateInsurancePolicyDto,
  QueryInsurancePoliciesParams,
  UpdateInsuranceMemberDto,
  UpdateInsurancePolicyDto,
} from '../types/insurance.types';

export const insuranceQueryKeys = {
  all: ['insurance'] as const,
  members: () => ['insurance', 'members'] as const,
  policies: (params: QueryInsurancePoliciesParams) => ['insurance', 'policies', params] as const,
  policyDetail: (id: number) => ['insurance', 'policies', 'detail', id] as const,
  familyView: () => ['insurance', 'family-view'] as const,
};

export function useInsuranceMembers() {
  return useQuery({
    queryKey: insuranceQueryKeys.members(),
    queryFn: () => insuranceService.getMembers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInsurancePolicies(params: QueryInsurancePoliciesParams) {
  return useQuery({
    queryKey: insuranceQueryKeys.policies(params),
    queryFn: () => insuranceService.getPolicies(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useInsurancePolicy(id?: number) {
  return useQuery({
    queryKey: insuranceQueryKeys.policyDetail(id ?? 0),
    queryFn: () => insuranceService.getPolicy(id!),
    enabled: typeof id === 'number',
    staleTime: 60 * 1000,
  });
}

export function useInsuranceFamilyView() {
  return useQuery({
    queryKey: insuranceQueryKeys.familyView(),
    queryFn: () => insuranceService.getFamilyView(),
    staleTime: 60 * 1000,
  });
}

export function useCreateInsuranceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInsuranceMemberDto) => insuranceService.createMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insuranceQueryKeys.all });
    },
  });
}

export function useUpdateInsuranceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInsuranceMemberDto }) =>
      insuranceService.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insuranceQueryKeys.all });
    },
  });
}

export function useDeleteInsuranceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => insuranceService.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insuranceQueryKeys.all });
    },
  });
}

export function useCreateInsurancePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInsurancePolicyDto) => insuranceService.createPolicy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insuranceQueryKeys.all });
    },
  });
}

export function useUpdateInsurancePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateInsurancePolicyDto }) =>
      insuranceService.updatePolicy(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: insuranceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: insuranceQueryKeys.policyDetail(variables.id) });
    },
  });
}

export function useDeleteInsurancePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => insuranceService.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insuranceQueryKeys.all });
    },
  });
}
