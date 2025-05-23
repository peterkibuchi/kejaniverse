"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  CreateUnitTypeFormSchema,
  type CreatePropertyPayload,
  type CreateUnitTypeFormData,
} from "~/lib/validators/property";
import { createProperty } from "~/server/actions/properties";
import {
  CreatePropertyFormContext,
  CreatePropertyFormDispatchContext,
} from "./context";

export function CreateUnitTypeForm() {
  const router = useRouter();
  const { propertyName, bankCode, bankAccountNumber, unitTypes } = useContext(
    CreatePropertyFormContext,
  );
  const setFormData = useContext(CreatePropertyFormDispatchContext);

  const { mutate: server_createProperty, isPending } = useMutation({
    mutationFn: async (data: CreatePropertyPayload) => createProperty(data),

    onSuccess: ({ propertyId, propertyName }) => {
      toast.success(`Success. Property "${propertyName}" created.`);
      router.push(`/properties/${propertyId}`);
    },

    onError: () => {
      toast.error("Failed. Please try again.");
    },
  });

  const form = useForm<CreateUnitTypeFormData>({
    resolver: zodResolver(CreateUnitTypeFormSchema),
    defaultValues: {
      unitType: "Single-room",
      rentPrice: 0,
    },
  });

  function onSubmit(values: CreateUnitTypeFormData) {
    setFormData((prev) => {
      const unitTypeExists = prev.unitTypes.find(
        (v) =>
          v.unitType === values.unitType && v.rentPrice === values.rentPrice,
      );

      if (unitTypeExists) {
        toast.error(
          `${unitTypeExists.unitType} with rent Ksh.${unitTypeExists.rentPrice} already exists in the list`,
        );
        return prev;
      }

      const unitTypes = [...prev.unitTypes, values];
      return { ...prev, unitTypes };
    });
    form.reset();
    form.setFocus("unitType");
  }

  function onDone() {
    server_createProperty({
      propertyName,
      bankCode,
      bankAccountNumber,
      unitTypes,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8"
      >
        <FormField
          control={form.control}
          name="unitType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CreateUnitTypeFormSchema.shape.unitType.options.map(
                      (option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rentPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rent Price</FormLabel>
              <FormControl>
                <Input type="number" step={100} placeholder="3500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="my-4 flex gap-4">
          <Button type="submit" variant={"secondary"}>
            <Icons.plus className="h-4 w-4" />
            <span>Add</span>
          </Button>
          <Button
            type="button"
            disabled={unitTypes.length === 0}
            onClick={onDone}
          >
            {isPending ? (
              <>
                <Icons.loader className="h-4 w-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Icons.check className="h-4 w-4" />
                <span>Done</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function UnitTypesTable({
  unitTypes,
}: {
  unitTypes: CreateUnitTypeFormData[];
}) {
  const setFormData = useContext(CreatePropertyFormDispatchContext);

  function deleteUnitType(unitType: CreateUnitTypeFormData) {
    setFormData((prev) => {
      const unitTypes = prev.unitTypes.filter(
        (prevUnitType) =>
          !(
            prevUnitType.unitType === unitType.unitType &&
            prevUnitType.rentPrice === unitType.rentPrice
          ),
      );
      return { ...prev, unitTypes };
    });
  }
  return (
    <Table className="max-w-[500px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Unit Type</TableHead>
          <TableHead className="text-right">Rent Price</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {unitTypes.map((unitType) => (
          <TableRow key={`${unitType.unitType}-${unitType.rentPrice}`}>
            <TableCell className="font-medium">{unitType.unitType}</TableCell>
            <TableCell className="text-right">{unitType.rentPrice}</TableCell>
            <TableCell className="text-right">
              <Button
                variant={"ghost"}
                size={"icon"}
                onClick={() => deleteUnitType(unitType)}
              >
                <Icons.trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
