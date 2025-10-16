import { storeToRefs } from 'pinia';
import { computed, type Ref, ref, watch } from 'vue';

import { findLastProcessByDocId } from '@/apps/document/api/graphql/incoming-process';
import { findLastOutProcessByDocId } from '@/apps/document/api/graphql/outgoing-process';
import { findLastProcessByDocSubmitId } from '@/apps/document/api/graphql/submit-process';
import { currentInstanceNode, getStartNode } from '@/apps/document/api/rest/flowDocument';
import type { DocIn } from '@/apps/document/model/doc/doc-in';
import type { DocOut } from '@/apps/document/model/doc/doc-out';
import type { DocSubmit } from '@/apps/document/model/doc/doc-submit-input';
import type { Process } from '@/apps/document/model/process/process';
import { useDocumentRolesStore } from '@/apps/document/store/document-role';
import type { NodeInputInterface } from '@/apps/work-flow/model/flow';
import { toastError } from '@/common/helpers/custom-toast-service';

export type DocumentType = 'incoming' | 'outgoing' | 'submit';
export type Document = DocIn | DocOut | DocSubmit;

/**
 * Composable for getting current node ID and process information from document
 * @param doc - Reactive reference to document
 * @param docType - Type of document ('incoming' | 'outgoing' | 'submit')
 * @returns Object with current node, process, and computed nodeId
 */
export function useCurrentNode(doc: Ref<Document | undefined>, docType: DocumentType) {
  const { userDeptRole } = storeToRefs(useDocumentRolesStore());
  
  const process = ref<Process | undefined>();
  const currNode = ref<NodeInputInterface | undefined>();
  
  // Computed nodeId from current node
  const nodeId = computed(() => currNode.value?.id || '');
  const flowInstanceId = computed(() => process.value?.flowInstanceId || '');
  const processId = computed(() => process.value?.id || '');
  const stepId = computed(() => process.value?.stepId || '');

  /**
   * Get process based on document type and ID
   */
  function getProcess(docId: string) {
    switch (docType) {
    case 'incoming':
      return findLastProcessByDocId(docId, userDeptRole.value);
    case 'outgoing':
      return findLastOutProcessByDocId(docId, userDeptRole.value);
    case 'submit':
      return findLastProcessByDocSubmitId(docId, userDeptRole.value);
    default:
      throw new Error(`Unknown document type: ${docType}`);
    }
  }

  /**
   * Get current node from process or start node from flow
   */
  async function getCurrentNode(proc: Process | undefined, flowId?: string) {
    if (proc?.flowInstanceId && proc.stepId) {
      // Get current node from running instance
      try {
        const node = await currentInstanceNode(proc.flowInstanceId, proc.stepId);
        currNode.value = node as NodeInputInterface | undefined;

      } catch (error) {
        console.error('Failed to get current instance node:', error);
        toastError({ message: 'Không thể lấy thông tin node hiện tại' });
        currNode.value = undefined;
      }
    } else if (flowId) {
      // Get start node for new workflow
      try {
        const startNode = await getStartNode(flowId);
        currNode.value = startNode as NodeInputInterface | undefined;
      } catch (error) {
        console.error('Failed to get start node:', error);
        if ((error as any).code === 'nodeNotFound') {
          toastError({ message: 'Không tìm thấy nốt bắt đầu của quy trình' });
        }
        currNode.value = undefined;
      }
    } else {
      currNode.value = undefined;
    }
  }

  // Watch for document changes
  watch(() => doc.value?.id, async (docId) => {
    if (!docId) {
      process.value = undefined;
      currNode.value = undefined;
      return;
    }

    try {
      const processQuery = getProcess(docId);
      
      processQuery.onResult(async (res) => {
        // Get process based on document type
        let processData;
        switch (docType) {
        case 'incoming':
          processData = res.data?.findLastProcessByDocId;
          break;
        case 'outgoing':
          processData = res.data?.findLastOutProcessByDocId;
          break;
        case 'submit':
          processData = res.data?.findLastProcessByDocSubmitId;
          break;
        }

        process.value = processData;
        
        // Get current node
        await getCurrentNode(processData, doc.value?.flowId);
      });
    } catch (error) {
      console.error('Failed to get process:', error);
      process.value = undefined;
      currNode.value = undefined;
    }
  }, { immediate: true });

  // Watch for process changes
  watch(() => process.value, async (proc) => {
    await getCurrentNode(proc, doc.value?.flowId);
  });

  return {
    // Reactive data
    process,
    currNode,
    
    // Computed properties
    nodeId,
    flowInstanceId,
    processId,
    stepId,
    
    // Methods
    getCurrentNode,
    getProcess,
    
    // Loading states
    isLoading: computed(() => !currNode.value && !!doc.value?.id)
  };
}
