import QRCode from "qrcode";
import { createTicketPayload } from "@/helpers/ticket";

type TicketImageInput = {
  eventId: string;
  eventTitle?: string;
  ticketType?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  ticketCode: string;
  ticketStatus?: string;
  orderReference?: string;
};

function escapeSvgText(value?: string | null) {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function downloadBlob(filename: string, blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

async function triggerPngDownload(filename: string, svgContent: string) {
  const svgBlob = new Blob([svgContent], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new window.Image();
    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to render ticket image."));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available in this browser.");
    }

    context.drawImage(image, 0, 0);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Unable to create ticket image."));
      }, "image/png");
    });

    downloadBlob(filename, pngBlob);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function downloadTicketImage(input: TicketImageInput) {
  const qrCodeSrc = await QRCode.toDataURL(
    createTicketPayload(input.eventId, input.ticketCode),
    { margin: 1, scale: 7 },
  );
  const eventTitle = escapeSvgText(input.eventTitle || "Zentry Ticket");
  const ticketType = escapeSvgText(input.ticketType || "Ticket");
  const attendeeName = escapeSvgText(input.attendeeName || "Guest");
  const attendeeEmail = escapeSvgText(input.attendeeEmail || "No email provided");
  const ticketCode = escapeSvgText(input.ticketCode);
  const ticketStatus = escapeSvgText((input.ticketStatus || "valid").toUpperCase());
  const orderReference = escapeSvgText(input.orderReference || "Not available");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090b23" />
      <stop offset="100%" stop-color="#171a31" />
    </linearGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#bg)" />
  <rect x="90" y="90" width="900" height="1170" rx="34" fill="#232638" stroke="#3c415d" stroke-width="2" />
  <text x="140" y="170" fill="#93a0bb" font-size="28" font-family="Arial, sans-serif">ZENTRY TICKET</text>
  <circle cx="858" cy="156" r="10" fill="#14d991" />
  <rect x="810" y="126" width="120" height="56" rx="28" fill="#123e38" />
  <text x="870" y="162" text-anchor="middle" fill="#14d991" font-size="30" font-weight="700" font-family="Arial, sans-serif">${ticketStatus}</text>

  <text x="140" y="250" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">EVENT</text>
  <text x="140" y="305" fill="#ffffff" font-size="54" font-weight="700" font-family="Arial, sans-serif">${eventTitle}</text>

  <text x="140" y="395" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">TICKET TYPE</text>
  <text x="140" y="445" fill="#ffffff" font-size="42" font-weight="700" font-family="Arial, sans-serif">${ticketType}</text>

  <text x="560" y="395" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">ATTENDEE NAME</text>
  <text x="560" y="445" fill="#ffffff" font-size="42" font-weight="700" font-family="Arial, sans-serif">${attendeeName}</text>

  <text x="140" y="535" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">ATTENDEE EMAIL</text>
  <text x="140" y="585" fill="#ffffff" font-size="32" font-family="Arial, sans-serif">${attendeeEmail}</text>

  <text x="140" y="675" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">ORDER REFERENCE</text>
  <text x="140" y="725" fill="#ffffff" font-size="34" font-family="Arial, sans-serif">${orderReference}</text>

  <rect x="140" y="790" width="390" height="170" rx="26" fill="#2b3046" />
  <text x="180" y="850" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">TICKET CODE</text>
  <text x="180" y="915" fill="#ffffff" font-size="44" font-weight="700" font-family="Courier New, monospace">${ticketCode}</text>

  <rect x="620" y="760" width="300" height="300" rx="28" fill="#ffffff" />
  <image href="${qrCodeSrc}" x="650" y="790" width="240" height="240" />

  <text x="140" y="1130" fill="#93a0bb" font-size="24" font-family="Arial, sans-serif">Keep this ticket image safe. It contains your QR code for entry.</text>
</svg>`.trim();

  await triggerPngDownload(`${input.ticketCode}.png`, svg);
}
