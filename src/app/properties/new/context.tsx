"use client";

import { createContext, type Dispatch, type SetStateAction } from "react";
import { z } from "zod";

import { unitTypeEnum } from "~/server/db/schema";

export const CreatePropertyFormSchema = z.object({
  propertyName: z
    .string()
    .nonempty("Property name is required")
    .min(4, {
      message: "Property name must be at least 4 characters long",
    })
    .max(64, { message: "Name can't be more than 64 characters" }),
  bankAccountNumber: z
    .string()
    .nonempty("Bank account number is required")
    .min(8, {
      message: "Bank account number must be at least 8 characters long",
    })
    .max(32, {
      message: "Bank account number can't be more than 32 characters",
    }),
});

export type CreatePropertyFormData = z.infer<typeof CreatePropertyFormSchema>;

export const CreateUnitTypeFormSchema = z.object({
  unitType: z.enum(unitTypeEnum.enumValues),
  rentPrice: z.number({ coerce: true }).int().min(1000).max(35000),
});

export type CreateUnitTypeFormData = z.infer<typeof CreateUnitTypeFormSchema>;

export type CreatePropertyFormContextType = CreatePropertyFormData & {
  unitTypes: CreateUnitTypeFormData[];
};

export const defaultContext: CreatePropertyFormContextType = {
  propertyName: "",
  bankAccountNumber: "",
  unitTypes: [],
};

export type CreatePropertyFormDispatch = Dispatch<
  SetStateAction<CreatePropertyFormContextType>
>;

export const CreatePropertyFormContext = createContext(defaultContext);

export const defaultSetValue: CreatePropertyFormDispatch = (v) => {
  console.log(v);
};

export const CreatePropertyFormDispatchContext =
  createContext<CreatePropertyFormDispatch>(defaultSetValue);
