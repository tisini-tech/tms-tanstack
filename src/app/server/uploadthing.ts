import { createUploadthing } from 'uploadthing/server'
import type { FileRouter } from 'uploadthing/server'

const f = createUploadthing()

export const uploadRouter = {
  imageUploader: f(
    {
      image: { maxFileSize: '4MB' },
      pdf: { maxFileSize: '4MB', maxFileCount: 1 },
    },
    { awaitServerData: false },
  ).onUploadComplete(async () => ({})),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
