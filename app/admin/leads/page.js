"use client";

import EditorAuthGate from "@/app/components/EditorAuthGate";
import ConsultationLeadsManager from "@/app/components/ConsultationLeadsManager";

export default function AdminLeadsPage() {
  return (
    <EditorAuthGate title="Admin Consultation Leads Desk">
      <div className="container" style={{ padding: "30px 20px 80px 20px" }}>
        <ConsultationLeadsManager />
      </div>
    </EditorAuthGate>
  );
}
