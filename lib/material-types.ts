export type MaterialMetadata = {
  id: string;
  userId: string;
  subjectId: string;
  fileName: string;
  fileType: string;
  mimeType?: string;
  fileSize: number;
  uploadedAt: string;
  status: string;
  storedLocally: boolean;
  pages: number;
  topics: string[];
  source: string;
};
