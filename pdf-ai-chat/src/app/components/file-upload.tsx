"use client";
import { useState } from "react";
import { Upload } from "lucide-react";

const FileUploadComponent: React.FC = () => {
  const handleFileUploadButtonClick = () => {
    const element = document.createElement("input");
    element.setAttribute("type", "file");
    element.setAttribute("accept", "application/pdf");
    element.click();
    element.addEventListener("change", async (event) => {
      if (element.files && element.files.length > 0) {
        const file = element.files[0];
        console.log("File selected:", file);

        const formData = new FormData();
        formData.append("pdf", file);

        await fetch("http://localhost:8000/upload/pdf", {
          method: "POST",
          body: formData,
        });

        console.log("File uploaded successfully");
      }
    });
  };

  return (
    <div className="bg-slate-800 border-2 border-amber-50 p-4 text-white rounded-lg cursor-pointer hover:bg-slate-700 transition-colors flex items-center justify-center">
      <div
        onClick={handleFileUploadButtonClick}
        className="flex flex-col items-center"
      >
        <h3>Upload PDF File</h3>
        <Upload />
      </div>
    </div>
  );
};

export default FileUploadComponent;
