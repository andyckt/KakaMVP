import { Suspense } from "react";
import GenerateContent from "./generate-content";

export default function GeneratePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenerateContent />
    </Suspense>
  );
}