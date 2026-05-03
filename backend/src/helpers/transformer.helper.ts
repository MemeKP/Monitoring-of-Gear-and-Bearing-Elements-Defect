import { ValueTransformer } from "typeorm";

export const commaSeparatedToArray: ValueTransformer = {
  to: (value: any[] | null) => {
    if (!value || value.length === 0) return null;
    return value.join(',');
  },
  from: (value: string | null) => {
    if (!value) return [];
    return value.split(',').map(Number);
  }
};