// @ts-nocheck
"use client"

import { useCallback, useEffect, useState } from "react"
import { FileRejection, useDropzone } from "react-dropzone"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button";
import { cn } from "@/lib/utils"
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { IconLoader2, IconTrash } from "@tabler/icons-react";
import axios from "axios";
import {useSellerStore} from "@/store/Seller"

export function Uploder(){

  const {imgUrls, setImgUrls, clearImgUrls, resetImgUrls, shouldResetUrls, setResetUrls, unsetResetUrls} = useSellerStore()

  const [files, setFiles] = useState<
    Array<{
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      isDeleting: boolean;
      error: boolean;
      objectUrl?: string;
      public_id?: string;
      cloudinaryUrl?: string
    }>
  >([]);

  useEffect(() => {
    if(shouldResetUrls){
      setFiles([])
      resetImgUrls()
      unsetResetUrls()
    }
  }, [shouldResetUrls])

  async function uplodeFile(file: File){
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.file === file ? { ...f, uploading: true } : f))
    );
    // console.log(file);
   
    
    const formData = new FormData();
    formData.append("file", file, file.name);

    // console.log(formData.get('file'));
    

    try {
      const response = await axios.post<any>(
        "/api/company/product/uplode_file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (e) => {
            if(e.total){
              const progress = Math.round((e.loaded / e.total || 0) * 100);
              setFiles((prevFiles) =>
                prevFiles.map((f) => (f.file === file ? { ...f, progress } : f))
              );
            }
          },
        }
      );
      
      console.log(response.data.res);
      const public_id = response.data.res.public_id
      const cloudinaryUrl = response.data.res.url
      console.log(cloudinaryUrl);
      
      toast.success(response.data.message);

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file ? { ...f, public_id, cloudinaryUrl, uploading: false } : f
        )
      )

      setImgUrls(cloudinaryUrl)
         
           
    } catch (error) {
      console.log(error);
      toast.error("Error uploading file");
      
      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.file === file ? { ...f, uploading: false, error: true } : f))
      );
    }
    
    // setFiles((prevFiles) =>
    //   prevFiles.map((f) => (f.file === file ? { ...f, uploading: false } : f))
    // );
    
  }

  function removeFile(public_id: string, cloudinaryUrl: string){
    if(!public_id){
      toast.error("Failed to delete");
      return console.error("public_id is undefined");
    }

    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.public_id === public_id ? { ...f, isDeleting: true } : f))
    );

    // console.log(public_id);

    const formData = new FormData();
    formData.append("public_id", public_id);
    
    try {
    //  const response = axios.delete<any>(`/api/seller/delete-file/${public_id}`)
      const response = axios.post<any>("/api/company/product/delete-file", formData)
      console.log(response);
      toast.success("Deleted successfully");
      setFiles((prevFiles) => prevFiles.filter((f) => f.public_id !== public_id));

      clearImgUrls(cloudinaryUrl)
    } catch (error) {
      console.log(error);
      toast.error("Error deleting file");
      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.public_id === public_id ? { ...f, isDeleting: false } : f))
      )
    }
    
  }


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) => ({
          id: uuidv4(),
          file,
          uploading: false,
          progress: 0,
          isDeleting: false,
          error: false,
          objectUrl: URL.createObjectURL(file),
          public_id: undefined
        })),
      ]);
     
      acceptedFiles.forEach(uplodeFile)
    }
    
  }, [])

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length) {
      const toomanyFiles = fileRejections.find(
        (rejection) => rejection.errors[0].code === "too-many-files"
      );

      const fileSizetoBig = fileRejections.find(
        (rejection) => rejection.errors[0].code === "file-too-large"
      );

      if (toomanyFiles) {
        toast.error("Too many files selected, max is 5");
      }

      if (fileSizetoBig) {
        toast.error("File size exceeds 5mb limit");
      }
    }
    
  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 5,
    maxSize: 1024 * 1024 * 10, // 10mb
    accept: {
      "image/*": [],
    },
  })

  return (
   <div className="flex flex-col justify-center items-center w-full ">
    <Card
      className={cn(
          "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64 shadow-xl",
          isDragActive
            ? "border-primary bg-primary/10 border-solid"
            : "border-border hover:border-primary"
      )}
     {...getRootProps()}>
      <CardContent className="flex items-center justify-center h-full w-full">
        <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <div className="flex flex-col items-center gap-y-3">
            <p className="text-xl">Drag 'n' drop some files here, or click to select files</p>

            <div className="px-8 py-2 mt-3 rounded-full relative bg-slate-300 dark:bg-slate-700 dark:text-white text-black text-sm hover:shadow-2xl hover:shadow-white/10 transition duration-200 border border-slate-600">
              <div className="absolute inset-x-0 h-px w-1/2 mx-auto -top-px shadow-2xl  bg-linear-to-r from-transparent via-teal-500 to-transparent" />
              <span className="relative z-20">Select files</span>
            </div>
          </div>
      }
      </CardContent>
    </Card>

    {files.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 w-full">
          {files.map(
            ({
              id,
              file,
              uploading,
              progress,
              isDeleting,
              error,
              objectUrl,
              public_id,
              cloudinaryUrl
            }) => {
              return (
                <div key={id} className="flex flex-col gap-1">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <img
                      src={objectUrl}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />

                    <Button
                      variant="destructive"
                      type="button"
                      size="icon"
                      className="absolute top-2 right-2 hover:bg-red-500 cursor-pointer"
                      onClick={() => removeFile(public_id!, cloudinaryUrl!)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <IconLoader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <IconTrash className="w-4 h-4" />
                      )}
                    </Button>
                    {uploading && !isDeleting && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white font-medium text-lg">
                          {progress}%
                        </div>
                      </div>
                    )} 
                    {error && (
                      <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                        <div className="text-white font-medium">Error</div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate px-1">
                    {file.name}
                  </p>
                </div>
              );
            }
          )}
        </div>
      )}
      {/* <button className="mt-4 border border-slate-600 px-4 py-2" onClick={() => console.log(imgUrls)} type="button">imgUrls</button> */}
   </div>
  )
}