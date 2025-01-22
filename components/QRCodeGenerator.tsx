import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import QRCode from 'qrcode';
import React, { useEffect, useState } from 'react';

interface QRCodeGeneratorProps {
  id: string; // Pass the cattle ID as a prop
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ id }) => {
  const [qrCodeUrl, setQRCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const link = `${window.location.origin}/cattle/${id}`; // Create the URL
        const url = await QRCode.toDataURL(link, {
          width: 300,
          margin: 2,
        });
        setQRCodeUrl(url); // Set the generated QR code URL
      } catch (error) {
        console.error('Error generating QR Code:', error);
      }
    };

    if (id) {
      generateQRCode(); // Auto-generate when the `id` is available
    }
  }, [id]);

  return (
    <div className="flex flex-col justify-center mt-6">
      <div className='flex items-center justify-between mb-3'>
        <h4 className="text-sm font-bold">Cattle QR Code</h4>
        {qrCodeUrl && (<a
          href={qrCodeUrl}
          download={`cattle-${id}-qrcode.png`}
          className="inline-block"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
        </a>)}
      </div>
      {qrCodeUrl ? (
        <Image src={qrCodeUrl} alt={`QR Code for cattle ${id}`} width={150} height={150} className='rounded shadow-lg' />
      ) : (
        <p className="text-gray-500">Generating QR Code...</p>
      )}
    </div>
  );
};

export default QRCodeGenerator;
