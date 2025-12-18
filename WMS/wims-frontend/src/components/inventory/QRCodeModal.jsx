import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Modal from "../ui/Modal";
import { Download, Printer } from "lucide-react";

const QRCodeModal = ({ isOpen, onClose, product }) => {
  const qrRef = useRef();

  if (!isOpen || !product) return null;

  // Function to download the QR Code
  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${product.sku}_qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to print the QR Code
  const printQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const imgUrl = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>Print QR Code - ${product.sku}</title></head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
          <h2 style="font-family:sans-serif; margin-bottom:10px;">${product.name}</h2>
          <img src="${imgUrl}" style="width:300px; height:300px;" />
          <p style="font-family:monospace; font-size:20px; margin-top:10px;">${product.sku}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Modal
      title="Product QR Code"
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div
          ref={qrRef}
          className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm"
        >
          <QRCodeCanvas
            value={JSON.stringify({ sku: product.sku, id: product.id })}
            size={200}
            level={"H"} // High error correction level
            includeMargin={true}
          />
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
          <p className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">
            {product.sku}
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={downloadQRCode}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <Download size={18} /> Download
          </button>
          <button
            onClick={printQRCode}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            <Printer size={18} /> Print
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
