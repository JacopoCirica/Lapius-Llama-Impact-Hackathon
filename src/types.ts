export type LapiusFormData = {
  text: string;
  image: string | null;
};

type Entity = {
  icd10: string;
  supported_evidence: string;
};

export type ClinicalResult = Array<{
  text_reference: string;
  list_of_entities: Entity[];
}>;

export type ClinicalResponse = {
  result: ClinicalResult;
};

export type ImageMedicalCode = {
  code: string;
  description: string;
  codeType: string;
};
