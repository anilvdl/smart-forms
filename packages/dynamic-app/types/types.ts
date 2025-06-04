import { IconKey } from "@smartforms/shared/icons";

export interface TemplateOption {
  formId?: string; 
  name: string;
  image: IconKey | string; 
  link: string;
  updatedAt?: string;
  userName?: string; 
  createdAt?: string;
  version?: number;
  status?: "WIP" | "PUBLISH"; 
  content?: any; 
  thumbnail?: string;
}