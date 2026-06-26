/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useCallback } from "react";
import { submitCompensation } from "../lib/api-client";
import { SubmitCompensationInput } from "../lib/validations";

export function useSubmitForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SubmitCompensationInput>({
    companyId: "",
    roleId: "",
    levelId: "",
    locationCity: "Bangalore",
    locationCountry: "India",
    locationRegion: "APAC",
    yearsOfExperience: 0,
    baseSalary: 0,
    annualBonus: 0,
    equityValueAnnual: 0,
    currency: "INR",
    offerDate: "06-2026",
    employmentType: "FULLTIME",
    dataSource: "SELF_REPORTED",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const setField = useCallback(
    <K extends keyof SubmitCompensationInput>(key: K, value: SubmitCompensationInput[K]) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));

      // Clear the error for this field if it is edited
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key as string];
        return updated;
      });
    },
    []
  );

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1));
  }, []);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setErrors({});
    setIsSuccess(false);

    try {
      const response = await submitCompensation(formData);
      if (response.success) {
        setIsSuccess(true);
      } else {
        setErrors(response.errors || { global: "Form submission failed. Please check validation metrics." });
      }
    } catch (err: any) {
      setErrors({ global: err?.message || "An unexpected server-side error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return {
    step,
    formData,
    setField,
    nextStep,
    prevStep,
    submit,
    isSubmitting,
    errors,
    isSuccess,
  };
}
