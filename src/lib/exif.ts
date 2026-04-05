import exifr from "exifr";

export async function extractCaptureDate(file: File): Promise<Date | null> {
  try {
    const exif = await exifr.parse(file, {
      pick: ["DateTimeOriginal", "CreateDate", "ModifyDate"],
    });
    if (!exif) return null;
    const dateValue =
      exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate;
    if (dateValue instanceof Date) return dateValue;
    return null;
  } catch {
    return null;
  }
}
