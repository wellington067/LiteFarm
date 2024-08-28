/*
 *  Copyright 2024 LiteFarm.org
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

import i18n from '../../../locales/i18n';
import { Animal, AnimalBatch, PostAnimalBatch, PostBatchSexDetail } from '../../../store/api/types';
import { toLocalISOString } from '../../../util/moment';
import { DetailsFields, type AnimalDetailsFormFields } from './types';

const formatFormTypeOrBreed = (
  typeOrBreed: 'type' | 'breed',
  data?: { label: string; value: string; __isNew__?: boolean },
) => {
  if (!data?.value) {
    return {};
  }
  if (data.__isNew__) {
    return { [`${typeOrBreed}_name`]: data.label };
  }
  const [defaultOrCustom, id] = data.value.split('_');

  return { [`${defaultOrCustom}_${typeOrBreed}_id`]: +id };
};

const formatFormSexDetailsAndCount = (
  data: AnimalDetailsFormFields,
): Pick<PostAnimalBatch, 'count' | 'animal_batch_sex_detail'> => {
  if (!data[DetailsFields.SEX_DETAILS] || !data[DetailsFields.SEX_DETAILS].length) {
    return { count: data[DetailsFields.COUNT]! };
  }

  return {
    count: data[DetailsFields.COUNT]!,
    animal_batch_sex_detail: data[DetailsFields.SEX_DETAILS].map(({ id, count }) => {
      return { sex_id: id, count };
    }),
  };
};

const formatFormUse = (
  isAnimal: boolean,
  use: AnimalDetailsFormFields[DetailsFields.USE],
  otherUse: AnimalDetailsFormFields[DetailsFields.OTHER_USE],
) => {
  if (!use || !use.length) {
    return {};
  }

  const key = `animal${isAnimal ? '' : '_batch'}_use_relationships`;

  const useRelations: { use_id: number; other_use?: string }[] = [];

  use.forEach(({ value: useId, label }, index: number) => {
    useRelations.push({ use_id: useId });
    if (label === i18n.t('animal:USE.OTHER') && otherUse) {
      useRelations[index].other_use = otherUse;
    }
  });

  return { [key]: useRelations };
};

const convertFormDate = (date?: string): string | undefined => {
  if (!date) {
    return undefined;
  }
  return toLocalISOString(date);
};

const formatOrigin = (
  data: AnimalDetailsFormFields,
  broughtInId?: number,
): Partial<Animal | PostAnimalBatch> => {
  if (broughtInId && data[DetailsFields.ORIGIN]) {
    return {
      origin_id: data[DetailsFields.ORIGIN],
      ...(data.origin_id === broughtInId
        ? {
            brought_in_date: convertFormDate(data[DetailsFields.BROUGHT_IN_DATE]),
            supplier: data[DetailsFields.SUPPLIER],
            price: data[DetailsFields.PRICE] ? +data[DetailsFields.PRICE] : undefined,
          }
        : {
            dam: data[DetailsFields.DAM],
            sire: data[DetailsFields.SIRE],
          }),
    };
  }

  return {};
};

const formatCommonDetails = (
  isAnimal: boolean,
  data: AnimalDetailsFormFields,
  broughtInId?: number,
): Partial<Animal | PostAnimalBatch> => {
  return {
    // General
    ...formatFormTypeOrBreed('type', data[DetailsFields.TYPE]),
    ...formatFormTypeOrBreed('breed', data[DetailsFields.BREED]),
    ...(isAnimal ? { sex_id: data[DetailsFields.SEX] } : formatFormSexDetailsAndCount(data)),
    ...formatFormUse(isAnimal, data[DetailsFields.USE], data[DetailsFields.OTHER_USE]),

    // Other
    organic_status: data[DetailsFields.ORGANIC_STATUS]?.value,
    notes: data[DetailsFields.OTHER_DETAILS],
    photo_url: data[DetailsFields.ANIMAL_IMAGE],

    // Origin
    ...formatOrigin(data, broughtInId),

    // Unique (animal) | General (batch)
    name: data[DetailsFields.NAME],
  };
};

export const formatAnimalDetailsToDBStructure = (
  data: AnimalDetailsFormFields,
  broughtInId?: number,
): Partial<Animal> => {
  return {
    ...formatCommonDetails(true, data, broughtInId),

    // Other
    weaning_date: convertFormDate(data[DetailsFields.WEANING_DATE]),

    // Unique
    birth_date: convertFormDate(data[DetailsFields.DATE_OF_BIRTH]),
    identifier: data[DetailsFields.TAG_NUMBER],
    identifier_type_id: data[DetailsFields.TAG_TYPE]?.value,
    identifier_color_id: data[DetailsFields.TAG_COLOR]?.value,
    identifier_type_other: data[DetailsFields.TAG_TYPE_INFO],
  };
};

export const formatBatchDetailsToDBStructure = (
  data: AnimalDetailsFormFields,
  broughtInId?: number,
): PostAnimalBatch => {
  return formatCommonDetails(false, data, broughtInId);
};
