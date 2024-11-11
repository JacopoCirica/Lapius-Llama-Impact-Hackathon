"use client";
import {
  CustomTextBox,
  LottieAnimation,
  MainDisclosure,
  MiniDisclosure,
} from "@/components";
import {
  LapiusFormData,
  ClinicalResult,
  ImageMedicalCode,
} from "@/components/types";
import { annotateMedicalImage, getClinicalNote } from "@/infra/apiClient";
import parseMedicalCodes from "@/utils/parseCodes";
import Image from "next/image";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [outputType, setOutputType] = useState<string>("text");
  const [medicalCodes, setMedicalCodes] = useState<ImageMedicalCode[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LapiusFormData>();
  const [responseData, setResponseData] = useState<ClinicalResult | null>(null);

  const onSubmit: SubmitHandler<LapiusFormData> = async (
    data: LapiusFormData
  ) => {
    setIsLoading(true);
    console.log(data);
    if (data.image === null) {
      setOutputType("text");
      await getClinicalNote(data, new AbortController().signal).then(
        (response: any) => {
          try {
            const parsedResult = response.result.map((item: any) =>
              JSON.parse(item)
            );

            setResponseData(parsedResult);
            console.log(parsedResult);
            setIsLoading(false);
          } catch (e: any) {
            setIsLoading(false);
            if (e.response.data.error)
              alert("The form is incomplete. Please check all details");
            throw e;
          }
        }
      );
    } else {
      setOutputType("image");
      await annotateMedicalImage(data.image).then((response: any) => {
        console.log(response);
        setIsLoading(false);
        const parsedCodes = parseMedicalCodes(response);
        setMedicalCodes(parsedCodes);
        console.log(parsedCodes);
      });
    }
    console.log("Form submitted with data:", data);
  };
  console.log(outputType);
  return (
    <div>
      <main className="relative container mx-auto  py-6 text-center z-10">
        <div className="inline-flex bg-black rounded-full px-4 py-2">
          <Image
            width={70}
            height={20}
            src="/logolapius.svg"
            alt="Logo of lapius"
          />
        </div>
        <div className="flex justify-center items-center gap-6 mt-12">
          <div className="w-[500px] h-[550px] bg-white rounded-lg shadow-lg">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="container mx-auto p-8"
            >
              <CustomTextBox
                register={register}
                setValue={setValue}
                error={errors}
              />
              <button
                type="submit"
                className={`w-1/4 mt-4 float-right py-2 font-semibold rounded-md transition ${
                  isLoading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex space-x-1 ml-2">
                    <span
                      className="w-2 h-2 bg-gray-200 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-200 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-200 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </span>
                ) : (
                  "Analyze"
                )}
              </button>
            </form>
          </div>
          <div className="border rounded-md bg-white w-[500px] h-[550px] overflow-y-auto p-6">
            {isLoading ? (
              <LottieAnimation
                src="/outputlot.json"
                className="w-[400px]"
                isAnimating={isLoading}
              />
            ) : !responseData?.length && !medicalCodes?.length ? (
              // Display message if there is no responseData and no medicalCodes
              <div className="text-center text-gray-600">
                Upload an image or enter your medical text
              </div>
            ) : outputType === "text" ? (
              <div>
                {/* Conditionally display the heading if responseData exists */}
                {responseData && responseData.length > 0 && (
                  <h2 className="text-left  mb-4">
                    Suggested{" "}
                    <span className="text-[#68B944] font-bold">ICD-10-CM</span>{" "}
                    codes:
                  </h2>
                )}

                {responseData?.map((item, index) => {
                  console.log("Full item object:", item);
                  const entities =
                    item?.list_of_entities || item["list_of_entities"];
                  if (entities) {
                    console.log("List of entities:", entities);
                  } else {
                    console.log("List of entities is undefined or empty");
                  }
                  return (
                    <div className="mt-4" key={index}>
                      <MainDisclosure
                        heading={entities?.[0]?.icd10 || "No ICD-10 Code"}
                        description={
                          entities?.[0]?.supported_evidence ||
                          "No description available"
                        }
                      >
                        <MiniDisclosure heading="Other codes">
                          {entities?.slice(1).map((entity, i) => (
                            <div key={i} className="mt-2">
                              <div className="font-semibold">
                                {entity?.icd10}
                              </div>
                              <div className="text-gray-600">
                                {entity?.supported_evidence}
                              </div>
                            </div>
                          ))}
                        </MiniDisclosure>
                      </MainDisclosure>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                {medicalCodes && medicalCodes.length > 0 && (
                  <h2 className="text-lg mb-4 text-left">
                    Suggested Medical Codes:
                  </h2>
                )}

                {/* Render the parsed medical codes */}
                {medicalCodes?.map((item, index) => (
                  <div className="mt-4" key={index}>
                    <MainDisclosure
                      heading={`${item.codeType} Code: ${item.code}`}
                      description={item.description}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
