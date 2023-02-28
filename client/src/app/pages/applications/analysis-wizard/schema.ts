import * as yup from "yup";
import { Application, IReadFile, Ref } from "@app/api/models";
import { useTranslation } from "react-i18next";
import { useAnalyzableApplicationsByMode } from "./utils";

export const ANALYSIS_MODES = [
  "binary",
  "source-code",
  "source-code-deps",
  "binary-upload",
] as const;
export type AnalysisMode = (typeof ANALYSIS_MODES)[number];

export type AnalysisScope = "app" | "app,oss" | "app,oss,select";

export interface ModeStepValues {
  mode: AnalysisMode;
  artifact: File | undefined | null;
}

const useModeStepSchema = ({
  applications,
}: {
  applications: Application[];
}): yup.SchemaOf<ModeStepValues> => {
  const { t } = useTranslation();
  const analyzableAppsByMode = useAnalyzableApplicationsByMode(applications);
  return yup.object({
    mode: yup
      .mixed<AnalysisMode>()
      .required(t("validation.required"))
      .test(
        "isModeCompatible",
        "Selected mode not supported for selected applications", // Message not exposed to the user
        (mode) => {
          const analyzableApplications = mode ? analyzableAppsByMode[mode] : [];
          if (mode === "binary-upload") {
            return analyzableApplications.length === 1;
          }
          return analyzableApplications.length > 0;
        }
      ),
    artifact: yup.mixed<File>().when("mode", {
      is: "binary-upload",
      then: (schema) => schema.required(),
    }),
  });
};

export interface TargetsStepValues {
  formTargets: string[];
  formRuleBundles: Ref[];
}

const useTargetsStepSchema = (): yup.SchemaOf<TargetsStepValues> => {
  const { t } = useTranslation();
  return yup.object({
    formTargets: yup
      .array()
      .of(yup.string().defined())
      .min(1, "At least 1 target is required"), // TODO translation here
    formRuleBundles: yup.array(),
  });
};

export interface ScopeStepValues {
  withKnown: AnalysisScope;
  includedPackages: string[];
  hasExcludedPackages: boolean;
  excludedPackages: string[];
}

const useScopeStepSchema = (): yup.SchemaOf<ScopeStepValues> => {
  const { t } = useTranslation();
  return yup.object({
    withKnown: yup.mixed<AnalysisScope>().required(t("validation.required")),
    includedPackages: yup
      .array()
      .of(yup.string().defined())
      .when("withKnown", (withKnown, schema) =>
        withKnown.includes("select") ? schema.min(1) : schema
      ),
    hasExcludedPackages: yup.bool().defined(),
    excludedPackages: yup
      .array()
      .of(yup.string().defined())
      .when("hasExcludedPackages", (hasExcludedPackages, schema) =>
        hasExcludedPackages ? schema.min(1) : schema
      ),
  });
};

export interface CustomRulesStepValues {
  formSources: string[];
  customRulesFiles: IReadFile[];
}

const useCustomRulesStepSchema = (): yup.SchemaOf<CustomRulesStepValues> => {
  const { t } = useTranslation();
  return yup.object({
    formSources: yup.array().of(yup.string().defined()),
    customRulesFiles: yup.array().of(yup.object() as yup.SchemaOf<IReadFile>),
  });
};

export interface OptionsStepValues {
  diva: boolean;
  excludedRulesTags: string[];
}

const useOptionsStepSchema = (): yup.SchemaOf<OptionsStepValues> => {
  const { t } = useTranslation();
  return yup.object({
    diva: yup.bool().defined(),
    excludedRulesTags: yup.array().of(yup.string().defined()),
  });
};

export type AnalysisWizardFormValues = ModeStepValues &
  TargetsStepValues &
  ScopeStepValues &
  CustomRulesStepValues &
  OptionsStepValues;

export const useAnalysisWizardFormValidationSchema = ({
  applications,
}: {
  applications: Application[];
}) => {
  const schemas = {
    modeStep: useModeStepSchema({ applications }),
    targetsStep: useTargetsStepSchema(),
    scopeStep: useScopeStepSchema(),
    customRulesStep: useCustomRulesStepSchema(),
    optionsStep: useOptionsStepSchema(),
  };
  const allFieldsSchema: yup.SchemaOf<AnalysisWizardFormValues> =
    schemas.modeStep
      .concat(schemas.targetsStep)
      .concat(schemas.scopeStep)
      .concat(schemas.customRulesStep)
      .concat(schemas.optionsStep);
  return {
    schemas,
    allFieldsSchema,
  };
};