"use client";

import { use } from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Printer, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const resolvedParams = use(params);
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/academy/certificate-data?uuid=${resolvedParams.certificateId}`)
      .then(res => res.json())
      .then(data => {
        setCertData(data.certificate);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [resolvedParams.certificateId]);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${certData?.user?.name}'s Certificate`,
          text: `I completed ${certData?.course?.title} on CyberAid Academy!`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-600">
        Certificate not found.
      </div>
    );
  }

  const date = new Date(certData.issuedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const verificationId = `${certData.uuid.split('-')[0].toUpperCase()}-${new Date(certData.issuedAt).getFullYear()}`;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:p-0">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/academy" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
          <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
          <span className="font-bold text-lg tracking-tight">CyberAid <span className="font-normal">Academy</span></span>
        </Link>
        <Link href="/academy/dashboard">
          <Button variant="outline" className="text-gray-700 border-gray-300 text-sm">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Certificate — fixed pixel size for reliable layout */}
      <div className="max-w-4xl mx-auto">
        <div
          ref={certRef}
          className="relative bg-white shadow-2xl print:shadow-none"
          style={{ width: "100%", paddingBottom: "70.7%" /* A4 landscape ratio */ }}
        >
          <div className="absolute inset-0 flex flex-col" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

            {/* Colored top band — sits inside the gold border */}
            <div className="absolute top-[10px] left-[10px] right-[10px] h-[13%] z-20" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f2444 100%)" }}>
              <div className="h-full flex flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-[#D4AF37]" style={{ width: "clamp(14px, 2vw, 22px)", height: "clamp(14px, 2vw, 22px)" }} />
                  <span className="text-white font-bold font-sans uppercase tracking-[0.4em]" style={{ fontSize: "clamp(10px, 1.6vw, 16px)" }}>CyberAid Academy</span>
                </div>
                <p className="text-[#D4AF37]/70 font-sans uppercase tracking-[0.25em]" style={{ fontSize: "clamp(7px, 0.9vw, 10px)" }}>Accredited Online Learning Platform</p>
              </div>
            </div>
            
            {/* Double Gold Border */}
            <div className="absolute inset-[10px] border-[3px] border-[#D4AF37] pointer-events-none z-10" />
            <div className="absolute inset-[16px] border-[1px] border-[#D4AF37]/50 pointer-events-none z-10" />

            {/* Corner ornaments */}
            <div className="absolute top-[6px] left-[6px] w-6 h-6 border-t-[3px] border-l-[3px] border-[#0A0A0A]/80 z-20" />
            <div className="absolute top-[6px] right-[6px] w-6 h-6 border-t-[3px] border-r-[3px] border-[#0A0A0A]/80 z-20" />
            <div className="absolute bottom-[6px] left-[6px] w-6 h-6 border-b-[3px] border-l-[3px] border-[#0A0A0A]/80 z-20" />
            <div className="absolute bottom-[6px] right-[6px] w-6 h-6 border-b-[3px] border-r-[3px] border-[#0A0A0A]/80 z-20" />

            {/* Content — strictly inside borders with padding, top padded to clear the colored band */}
            <div className="absolute inset-[22px] flex flex-col items-center justify-between text-center px-10 overflow-hidden" style={{ paddingTop: "18%", paddingBottom: "2.5%" }}>

              {/* Heading + Recipient — grouped together, continuous */}
              <div className="w-full flex flex-col items-center">
                <p className="uppercase tracking-[0.35em] text-gray-500 font-sans font-semibold" style={{ fontSize: "clamp(8px, 1vw, 11px)", marginBottom: "0.25em" }}>Certificate of Achievement</p>
                <h1 className="font-bold uppercase tracking-[0.12em] text-gray-900 leading-tight" style={{ fontSize: "clamp(18px, 3.2vw, 34px)", marginBottom: "0.6em" }}>
                  Certificate of Completion
                </h1>
                <p className="uppercase tracking-[0.3em] text-gray-600 font-sans font-semibold" style={{ fontSize: "clamp(8px, 1vw, 10px)", marginBottom: "0.4em" }}>This is to certify that</p>
                <h2 className="text-[clamp(28px,5vw,56px)] text-[#B8860B] font-serif capitalize leading-none mb-3">
                  {certData.user.name}
                </h2>
                <div className="h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-3" />
                <p className="uppercase tracking-[0.3em] text-gray-500 font-sans font-semibold" style={{ fontSize: "clamp(8px, 1vw, 10px)", marginBottom: "0.4em" }}>
                  has successfully completed the course
                </p>
                <h3 className="font-bold text-gray-900 uppercase tracking-wider leading-snug max-w-[70%] mx-auto" style={{ fontSize: "clamp(13px, 2vw, 22px)" }}>
                  {certData.course.title}
                </h3>
              </div>

              {/* Bottom: Date + Org Details + Verification */}
              <div className="w-full flex items-end justify-between px-4">
                <div className="text-left">
                  <p className="text-[8px] uppercase tracking-[0.25em] text-gray-400 font-sans">Date of Completion</p>
                  <p className="text-[11px] font-bold text-gray-800 font-sans mt-0.5 uppercase tracking-wider">{date}</p>
                </div>

                {/* Organization — Issued & Verified first, details below */}
                <div className="flex flex-col items-center text-center gap-1">
                  <p className="text-[7px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold font-sans">Issued &amp; Verified</p>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-700 font-sans">CyberAid Academy</span>
                    <span className="text-[#D4AF37]/60 text-[9px] font-sans">|</span>
                    <span className="text-[9px] text-gray-500 font-sans">cyberaid.support@gmail.com</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-[0.25em] text-gray-400 font-sans">Verification ID</p>
                  <p className="text-[11px] font-bold text-gray-800 font-sans mt-0.5 uppercase tracking-wider">{verificationId}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3 w-full print:hidden">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-gray-900 hover:bg-black text-white h-11"
          >
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-11"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {copied ? "Link Copied!" : "Share Certificate"}
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-11"
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 print:hidden">
          Use "Save as PDF" in your browser's print dialog to download.
        </p>
      </div>
    </div>
  );
}
