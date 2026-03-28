import { Suspense } from "react";
import RootPaymentCallbackClient from "@/components/RootPaymentCallbackClient";

function Page() {
  return (
    <Suspense fallback={null}>
      <RootPaymentCallbackClient />
    </Suspense>
  );
}

export default Page;
