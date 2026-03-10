import { create } from 'zustand';
import type { OneSignalSegment } from '../lib/onesignal';

interface NotificationState {
  optedInSegments: OneSignalSegment[];
  hasPrompted: boolean;
  setOptedInSegments: (segments: OneSignalSegment[]) => void;
  setHasPrompted: (value: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  optedInSegments: [],
  hasPrompted: false,
  setOptedInSegments: (segments) => set({ optedInSegments: segments }),
  setHasPrompted: (value) => set({ hasPrompted: value }),
}));
