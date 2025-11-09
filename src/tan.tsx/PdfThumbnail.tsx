import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Cấu hình worker cho pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

interface PdfThumbnailProps {
  url: string;
  className?: string;
  alt?: string;
}

const PdfThumbnail: React.FC<PdfThumbnailProps> = ({ url, className, alt }) => {
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        // Tạo canvas để render trang PDF
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport, canvas }).promise;

        // Chuyển canvas thành ảnh base64
        const imageData = canvas.toDataURL("image/png");
        setImageSrc(imageData);
      } catch (error) {
        console.error("Error rendering PDF:", error);
      }
    };

    loadPdf();
  }, [url]);

  // Nếu chưa render xong thì hiển thị placeholder
  return imageSrc ? (
    <img
      src={imageSrc}
      alt={alt || "PDF Thumbnail"}
      className={className || "w-full h-full object-cover"}
    />
  ) : (
    <div className="w-full h-full bg-gray-200 animate-pulse" />
  );
};

export default PdfThumbnail;
