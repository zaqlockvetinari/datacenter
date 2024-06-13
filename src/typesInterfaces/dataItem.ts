import { DATAITEM_TYPES } from '../constants';

export type TYPE_DATAITEM_TYPES = typeof DATAITEM_TYPES[number];

export interface DataItemInterface {
  creationDate: string;
  tags: string[];
  field1?: string;
  field2: string | number;
  image?: string;
  images?: string[];
  type: TYPE_DATAITEM_TYPES;
  userEmail: string;
  quizzOk?: number; // type = 'question'
  quizzKo?: number; // type = 'question'
}

export interface DataItemInterfaceWithId extends DataItemInterface {
  creationDate: string;
  id: string;
}

export type DataItemType = DataItemInterfaceWithId | undefined;

export interface DataItemProviderInterface {
  userPreferenceStore: DataItemType;
  setUserPreferenceStore: (data: DataItemType) => void;
}
