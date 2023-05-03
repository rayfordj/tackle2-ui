import { TableComposableProps } from "@patternfly/react-table";
import {
  IFilterStateArgs,
  ILocalFilterDerivedStateArgs,
  IFilterPropsArgs,
} from "./filtering";
import {
  ILocalSortDerivedStateArgs,
  ISortPropsArgs,
  ISortStateArgs,
} from "./sorting";
import {
  IPaginationStateArgs,
  ILocalPaginationDerivedStateArgs,
  IPaginationPropsArgs,
} from "./pagination";
import { useCompoundExpansionState } from "../useCompoundExpansionState";
import { useSelectionState } from "@migtools/lib-ui";
import { KeyWithValueType } from "@app/utils/type-utils";

// Generic type params used here:
//   TItem - The actual API objects represented by rows in the table. Can be any object.
//   TColumnKey - Union type of unique identifier strings for the columns in the table
//   TSortableColumnKey - A subset of column keys that have sorting enabled
//   TFilterCategoryKey - Union type of unique identifier strings for filters (not necessarily the same as column keys)

// TODO when calling useTableControlUrlParams, the TItem type is not inferred and some of the params have it inferred as `unknown`.
//      this currently doesn't seem to matter since TItem becomes inferred later when currentPageItems is in scope,
//      but we should see if we can fix that (maybe not depend on TItem in the extended types here, or find a way
//      to pass TItem while still letting the rest of the generics be inferred -- newer TS 5.0 features?)

// Common args
// - Used by both useLocalTableControlState and useTableControlUrlParams
// - Does not require any state or query values in scope
export interface ITableControlCommonArgs<
  TItem,
  TColumnKey extends string,
  TSortableColumnKey extends TColumnKey,
  TFilterCategoryKey extends string = string
> extends IFilterStateArgs<TItem, TFilterCategoryKey>,
    ISortStateArgs<TSortableColumnKey>,
    IPaginationStateArgs {
  columnNames: Record<TColumnKey, string>; // An ordered mapping of unique keys to human-readable column name strings
  isSelectable?: boolean;
  hasPagination?: boolean;
  expandableVariant?: "single" | "compound" | null;
  hasActionsColumn?: boolean;
  variant?: TableComposableProps["variant"];
}

// Data-dependent args
// - Used by both useLocalTableControlState and useTableControlProps
// - Requires query values and defined TItem type in scope but not state values
export interface ITableControlDataDependentArgs<TItem> {
  isLoading?: boolean;
  idProperty: KeyWithValueType<TItem, string>;
}

// Derived state option args
// - Used by only useLocalTableControlState (client-side filtering/sorting/pagination)
// - Requires state and query values in scope
export type IUseLocalTableControlStateArgs<
  TItem,
  TColumnKey extends string,
  TSortableColumnKey extends TColumnKey,
  TFilterCategoryKey extends string = string
> = ITableControlCommonArgs<
  TItem,
  TColumnKey,
  TSortableColumnKey,
  TFilterCategoryKey
> &
  ITableControlDataDependentArgs<TItem> &
  ILocalFilterDerivedStateArgs<TItem, TFilterCategoryKey> &
  IFilterStateArgs<TItem, TFilterCategoryKey> &
  ILocalSortDerivedStateArgs<TItem, TSortableColumnKey> &
  ILocalPaginationDerivedStateArgs<TItem>;

// Rendering args
// - Used by only useTableControlProps
// - Requires state and query values in scope
// - Combines all args above with either:
//   - The return values of useLocalTableControlState
//   - The return values of useTableControlUrlParams and args derived from server-side filtering/sorting/pagination
export interface IUseTableControlPropsArgs<
  TItem,
  TColumnKey extends string,
  TSortableColumnKey extends TColumnKey,
  TFilterCategoryKey extends string = string
> extends ITableControlCommonArgs<
      TItem,
      TColumnKey,
      TSortableColumnKey,
      TFilterCategoryKey
    >,
    ITableControlDataDependentArgs<TItem>,
    IFilterPropsArgs<TItem, TFilterCategoryKey>,
    ISortPropsArgs<TColumnKey, TSortableColumnKey>,
    IPaginationPropsArgs {
  currentPageItems: TItem[];
  expansionState: ReturnType<
    typeof useCompoundExpansionState<TItem, TColumnKey>
  >;
  selectionState: ReturnType<typeof useSelectionState<TItem>>;
}