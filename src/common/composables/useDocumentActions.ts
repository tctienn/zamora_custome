import { ref } from 'vue';

import EventBus from '@/common/helpers/event-bus';

// Define types for our events
export interface DocumentActionPayload {
  action: 'saveAndBack' | 'saveAndContinue'
  data?: any
}

// Create event names
export const DOCUMENT_ACTION_EVENT = 'document-action';
export const DOCUMENT_SAVE_AND_BACK_EVENT = 'document-save-and-back';
export const DOCUMENT_SAVE_AND_CONTINUE_EVENT = 'document-save-and-continue';

// Composable function
export function useDocumentActions() {
  // State to track if we're in a saving state
  const isSaving = ref(false);
  
  // Function to emit save and back event
  const emitSaveAndBack = (data?: any) => {
    isSaving.value = true;
    EventBus.emit(DOCUMENT_SAVE_AND_BACK_EVENT, data);
    EventBus.emit(DOCUMENT_ACTION_EVENT, {
      action: 'saveAndBack',
      data 
    } as DocumentActionPayload);
  };
  
  // Function to emit save and continue event
  const emitSaveAndContinue = (data?: any) => {
    isSaving.value = true;
    EventBus.emit(DOCUMENT_SAVE_AND_CONTINUE_EVENT, data);
    EventBus.emit(DOCUMENT_ACTION_EVENT, {
      action: 'saveAndContinue',
      data 
    } as DocumentActionPayload);
  };
  
  // Function to emit custom document action event
  const emitDocumentAction = (payload: DocumentActionPayload) => {
    EventBus.emit(DOCUMENT_ACTION_EVENT, payload);
  };
  
  // Function to listen for save and back events
  const onSaveAndBack = (callback: (data?: any) => void) => {
    EventBus.on(DOCUMENT_SAVE_AND_BACK_EVENT, callback);
    return () => EventBus.off(DOCUMENT_SAVE_AND_BACK_EVENT, callback);
  };
  
  // Function to listen for save and continue events
  const onSaveAndContinue = (callback: (data?: any) => void) => {
    EventBus.on(DOCUMENT_SAVE_AND_CONTINUE_EVENT, callback);
    return () => EventBus.off(DOCUMENT_SAVE_AND_CONTINUE_EVENT, callback);
  };
  
  // Function to listen for any document action events
  const onDocumentAction = (callback: (payload: DocumentActionPayload) => void) => {
    EventBus.on(DOCUMENT_ACTION_EVENT, callback);
    return () => EventBus.off(DOCUMENT_ACTION_EVENT, callback);
  };
  
  // Function to reset saving state
  const resetSavingState = () => {
    isSaving.value = false;
  };
  
  return {
    isSaving,
    emitSaveAndBack,
    emitSaveAndContinue,
    emitDocumentAction,
    onSaveAndBack,
    onSaveAndContinue,
    onDocumentAction,
    resetSavingState
  };
}