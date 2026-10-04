import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AmbulanceType, Priority } from '@/lib/api/types';

export type RequestDraft = {
  pickupAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  patientCondition: string;
  priority: Priority;
  requestedAmbulanceType: AmbulanceType | null;
};

type RequestWizardState = {
  step: number;
  draft: RequestDraft;
  setStep: (step: number) => void;
  updateDraft: (values: Partial<RequestDraft>) => void;
  reset: () => void;
};

const initialDraft: RequestDraft = {
  pickupAddress: '',
  pickupLat: null,
  pickupLng: null,
  patientCondition: '',
  priority: 'MEDIUM',
  requestedAmbulanceType: null,
};

// sessionStorage, not local: a half-filled emergency form should not outlive the tab or leak
// to the next person on a shared device.
export const useRequestWizardStore = create<RequestWizardState>()(
  persist(
    (set) => ({
      step: 0,
      draft: initialDraft,
      setStep: (step) => set({ step }),
      updateDraft: (values) => set((state) => ({ draft: { ...state.draft, ...values } })),
      reset: () => set({ step: 0, draft: initialDraft }),
    }),
    {
      name: 'rapidaid-request-wizard',
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
    },
  ),
);
