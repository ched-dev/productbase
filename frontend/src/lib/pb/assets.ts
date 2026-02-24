// import { type APIErrorResult, getApiError } from "@/lib/pb/errors";
// import type { Asset, SiteSettingsBase } from "@/types";
// import { usePbClient } from "./client";

// export async function uploadAsset(
//   file: File,
//   folderId: SiteSettingsBase["avatar_file_folder_id"],
// ): Promise<Asset | APIErrorResult> {
//   const pb = usePbClient();
//   const formData = new FormData();
//   if (folderId) {
//     formData.append("folder", folderId);
//   }
//   formData.append("file", file);

//   try {
//     const result: Asset = await pb.request(uploadFiles(formData, {
//       fields: ["*"],
//     }));
//     console.log("uploadAsset result", result);

//     return result;
//   } catch (error) {
//     const apiError = getApiError(error);

//     return apiError;
//   }
// }
