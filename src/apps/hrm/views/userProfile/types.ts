import type { MenuItem } from 'primevue/menuitem';

import type { ProfilesHistory } from '@/apps/hrm/model/employee';

export interface ProfileHistoryItem extends ProfilesHistory {
  version: number
  displayName: string
  command?: () => void
}

export interface FileViewerState {
  isVisible: boolean
  fileBlob: Blob | null
  viewType: string
}

export interface PrintMenuItem extends MenuItem {
  type: 'MINISTRY_OF_INTERIOR' | 'CENTRAL_ORGANIZATION'
}

export interface ProfileComparisonResult {
  snapshotId: string
  historySnapshotId: string
  isCurrentVersion: boolean
  status: string
  createdTime: string | null
  orderNumber: number
  hasChanges: boolean
}

export type ProfileStatus = 'ACTIVE' | 'DRAFT' | 'PENDING' | 'OLD' | 'REJECTED'

export interface VersionProfileData {
  currentSnapshotId: string
  historyItems: ProfileHistoryItem[]
  currentVersionText: string
}
