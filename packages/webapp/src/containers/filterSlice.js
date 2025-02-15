/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import i18n from '../locales/i18n';
import { getDateInputFormat } from '../util/moment';

const initialCropCatalogueFilter = {
  STATUS: {},
  LOCATION: {},
  SUPPLIERS: {},
  date: undefined,
};
const initialDocumentsFilter = {
  TYPE: {},
  VALID_ON: undefined,
};
const initialTasksFilter = {
  STATUS: {},
  TYPE: {},
  LOCATION: {},
  CROP: {},
  ASSIGNEE: {},
  FROM_DATE: undefined,
  TO_DATE: undefined,
  IS_ASCENDING: false,
};
const initialTransactionsFilter = {
  EXPENSE_TYPE: undefined,
  REVENUE_TYPE: undefined,
};

export const initialAnimalsFilter = {
  ANIMAL_OR_BATCH: {},
  TYPE: {},
  BREED: {},
  SEX: {},
  LOCATION: {},
};

export const initialState = {
  cropCatalogue: initialCropCatalogueFilter,
  documents: initialDocumentsFilter,
  tasks: initialTasksFilter,
  transactions: initialTransactionsFilter,
  animals: initialAnimalsFilter,
};

const filterSliceReducer = createSlice({
  name: 'filterReducer',
  initialState,
  reducers: {
    resetFilters: (state) => initialState,
    resetCropCatalogueFilter: (state) => {
      state.cropCatalogue = initialCropCatalogueFilter;
    },
    setCropCatalogueFilter: (state, { payload: cropCatalogueFilter }) => {
      Object.assign(state.cropCatalogue, cropCatalogueFilter);
    },
    setCropCatalogueFilterDate: (state, { payload: date }) => {
      state.cropCatalogue.date = date;
    },
    setCropVarietyFilterDefault: (state, { payload: cropId }) => {
      state[`${cropId}`] = initialCropCatalogueFilter;
    },
    setCropVarietyFilter: (state, { payload: { cropId, cropVarietyFilter } }) => {
      Object.assign(state[`${cropId}`], cropVarietyFilter);
    },
    removeFilter: (state, { payload: { pageFilterKey, filterKey, value } }) => {
      state[pageFilterKey][filterKey][value].active = false;
    },
    removeNonFilterValue: (state, { payload: { pageFilterKey, filterKey } }) => {
      state[pageFilterKey][filterKey] = undefined;
    },
    resetDocumentsFilter: (state) => {
      state.documents = initialDocumentsFilter;
    },
    setDocumentsFilter: (state, { payload: documentsFilter }) => {
      Object.assign(state.documents, documentsFilter);
    },
    clearTasksFilter: (state) => {
      state.tasks = initialTasksFilter;
    },
    resetTasksFilter: (state, { payload: { user_id, userFarms } }) => {
      state.tasks = {
        ...initialTasksFilter,
        ASSIGNEE: userFarms.reduce((assignees, userFarm) => {
          assignees[userFarm.user_id] = {
            active: false,
            label: `${userFarm.first_name} ${userFarm.last_name}`,
          };
          return assignees;
        }, {}),
      };
      state.tasks.ASSIGNEE[user_id].active = true;
      state.tasks.ASSIGNEE['unassigned'] = {
        active: false,
        label: i18n.t('TASK.UNASSIGNED'),
      };
    },
    setTasksFilter: (state, { payload: tasksFilter }) => {
      Object.assign(state.tasks, tasksFilter);
    },
    setTasksFilterUnassignedDueThisWeek: (state, { payload: { date = new Date() } }) => {
      const oneWeekFromDate = new Date(date.valueOf());
      oneWeekFromDate.setDate(date.getDate() + 6);
      state.tasks = {
        ...initialTasksFilter,
        ASSIGNEE: Object.keys(state.tasks.ASSIGNEE).reduce((assignees, assigneeUserId) => {
          assignees[assigneeUserId] = {
            active: false,
            label: state.tasks.ASSIGNEE[assigneeUserId].label,
          };
          return assignees;
        }, {}),
        FROM_DATE: getDateInputFormat(date),
        TO_DATE: getDateInputFormat(oneWeekFromDate),
      };
      state.tasks.ASSIGNEE['unassigned'] = {
        active: true,
        label: i18n.t('TASK.UNASSIGNED'),
      };
    },
    setTasksFilterDueToday: (
      state,
      { payload: { user_id, first_name, last_name, date = new Date() } },
    ) => {
      const dayBefore = new Date(date.valueOf());
      dayBefore.setDate(date.getDate() - 1);
      state.tasks = {
        ...initialTasksFilter,
        ASSIGNEE: Object.keys(state.tasks.ASSIGNEE).reduce((assignees, assigneeUserId) => {
          assignees[assigneeUserId] = {
            active: false,
          };
          return assignees;
        }, {}),
        FROM_DATE: getDateInputFormat(dayBefore),
        TO_DATE: getDateInputFormat(date),
      };
      state.tasks.ASSIGNEE[user_id] = {
        active: true,
        label: `${first_name} ${last_name}`,
      };
    },
    updateTasksFilterObjects: (state, { payload: { activeUsers, taskTypes, locations, t } }) => {
      state.tasks = {
        ...state.tasks,
        ASSIGNEE: {
          unassigned: { active: false, label: t('TASK.UNASSIGNED') },
          ...activeUsers.reduce((prev, curr) => {
            prev[curr.user_id] = {
              active: false,
              label: `${curr.first_name} ${curr.last_name}`,
            };
            return prev;
          }, {}),
          ...state.tasks.ASSIGNEE,
        },
        TYPE: {
          ...taskTypes.reduce((prev, curr) => {
            prev[curr.task_type_id] = {
              active: false,
              label: t(`task:${curr.task_translation_key}`),
            };
            return prev;
          }, {}),
          ...state.tasks.TYPE,
        },
        LOCATION: {
          ...locations.reduce((prev, curr) => {
            prev[curr.location_id] = {
              active: false,
              label: curr.name,
            };
            return prev;
          }, {}),
          ...state.tasks.LOCATION,
        },
      };
    },
    resetTransactionsFilter: (state) => {
      state.transactions = initialTransactionsFilter;
    },
    setTransactionsFilter: (state, { payload: transactionsFilter }) => {
      Object.assign(state.transactions, transactionsFilter);
    },
    resetAnimalsFilter: (state) => {
      state.animals = initialAnimalsFilter;
    },
    setAnimalsFilter: (state, { payload: animalsFilter }) => {
      Object.assign(state.animals, animalsFilter);
    },
  },
});

export const {
  resetFilters,
  resetCropCatalogueFilter,
  setCropCatalogueFilter,
  setCropCatalogueFilterDate,
  setCropVarietyFilterDefault,
  setCropVarietyFilter,
  removeFilter,
  removeNonFilterValue,
  resetDocumentsFilter,
  setDocumentsFilter,
  resetTasksFilter,
  clearTasksFilter,
  setTasksFilter,
  setTasksFilterUnassignedDueThisWeek,
  setTasksFilterDueToday,
  updateTasksFilterObjects,
  resetTransactionsFilter,
  setTransactionsFilter,
  resetAnimalsFilter,
  setAnimalsFilter,
} = filterSliceReducer.actions;
export default filterSliceReducer.reducer;

const filterReducerSelector = (state) => {
  return state?.tempStateReducer[filterSliceReducer.name];
};

export const cropCatalogueFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.cropCatalogue,
);
export const cropVarietyFilterSelector = (cropId) => {
  return createSelector([filterReducerSelector], (filterReducer) => filterReducer[`${cropId}`]);
};
export const documentsFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.documents,
);
export const tasksFilterSelector = createSelector([filterReducerSelector], (filterReducer) => {
  return filterReducer.tasks;
});
export const cropCatalogueFilterDateSelector = createSelector(
  [cropCatalogueFilterSelector],
  (cropCatalogueFilter) => cropCatalogueFilter.date || getDateInputFormat(new Date()),
);
export const transactionsFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.transactions,
);
export const animalsFilterSelector = createSelector(
  [filterReducerSelector],
  (filterReducer) => filterReducer.animals,
);

export const isFilterCurrentlyActiveSelector = (pageFilterKey, defaultAllActive = false) => {
  return createSelector([filterReducerSelector], (filterReducer) => {
    const targetPageFilter = filterReducer[pageFilterKey];
    let isActive = false;
    let allActive = null;

    for (const filterKey in targetPageFilter) {
      const filter = targetPageFilter[filterKey];
      const filterType = typeof filter;

      if (filterType === 'object') {
        isActive = Object.values(filter).reduce((acc, curr) => {
          return acc || curr.active;
        }, isActive);
        // Only keep calculating this if it's the first filter or if the previous ones have checked true
        if (allActive === null || allActive === true) {
          allActive = Object.values(filter).every((filter) => filter.active);
        }
      } else {
        isActive = isActive || filterType === 'string';
      }
    }

    if (defaultAllActive && allActive !== null) {
      isActive = !allActive;
    }

    return isActive;
  });
};
