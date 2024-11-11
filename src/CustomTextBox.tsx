"use client";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { LapiusFormData } from "./types";

type CustomTextBoxProps = {
  register: UseFormRegister<LapiusFormData>;
  setValue: UseFormSetValue<LapiusFormData>;
  error: FieldErrors<LapiusFormData>;
};
const CustomTextBox = ({ register, setValue, error }: CustomTextBoxProps) => {
  console.log(error);
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.replace(
          /^data:image\/[a-zA-Z]+;base64,/,
          ""
        );

        setImage(result);
        setValue("image", base64String);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    setValue("image", null);
  };

  const removeImage = () => {
    setImage(null);
    setValue("image", null); // Clear the form's image field
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 text-left">
          Write your note!
        </h1>
        <button
          type="button"
          onClick={() => document.getElementById("fileInput")?.click()}
          className="flex bg-[#68B944] text-white px-2 py-2 rounded-md text-sm"
        >
          Upload Image <PhotoIcon className="h-5 w-5 ml-2" />
        </button>

        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      <p className="text-gray-600 mb-4 text-left mt-1">
        Write your clinical note here. You can also upload an image.
      </p>
      {image ? (
        <div className="relative">
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-[320px] rounded-md mb-2"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <textarea
          {...register("text", {
            required: "Please enter some text in the note.",
          })}
          value={text}
          onChange={handleTextChange}
          className="w-full p-4 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Write your clinical note here..."
          rows={12}
        />
      )}
    </div>
  );
};
export default CustomTextBox;
