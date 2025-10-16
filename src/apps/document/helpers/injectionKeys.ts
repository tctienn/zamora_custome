import { type InjectionKey, type UnwrapNestedRefs } from 'vue';

import type { DocOutSearch, DocSubmitSearch, SearchModel } from '@/apps/document/model/doc/search';

export const modelSearchFieldInKey = Symbol('modelSearchField for doc in') as InjectionKey<UnwrapNestedRefs<SearchModel>>;
export const modelSearchFieldOutKey = Symbol('modelSearchField for doc out') as InjectionKey<UnwrapNestedRefs<DocOutSearch>>;
export const modelSearchFieldSubmitKey = Symbol('modelSearchField for doc submit') as InjectionKey<UnwrapNestedRefs<DocSubmitSearch>>;