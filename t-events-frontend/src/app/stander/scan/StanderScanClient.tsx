"use client";

import Container from "@/components/ui/Container";
import RequireAuth from "@/features/auth/RequireAuth";
import {
  RedemptionConfirmedPanel,
  RedemptionPreviewPanel,
  StanderScanErrors,
  StanderScanHero,
  StanderScanInputPanel,
} from "@/features/reward/StanderScanViews";
import { useStanderScanPage } from "@/features/reward/useStanderScanPage";

export default function StanderScanClient() {
  const {
    cameraError,
    canConfirm,
    confirmMutation,
    confirmedRedemption,
    currentRequest,
    handleManualSubmit,
    handleReset,
    isCameraActive,
    preview,
    previewMutation,
    setTokenInput,
    startCamera,
    step,
    stopCamera,
    tokenError,
    tokenInput,
    videoRef,
  } = useStanderScanPage();

  return (
    <RequireAuth allowedRoles={["stander", "admin"]}>
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-brand-mist)] pb-16">
        <Container>
          <div className="py-4 sm:py-10 lg:py-12">
            <StanderScanHero />

            <div className="mt-5 space-y-4 sm:mt-6">
              {(step === "scan" || step === "error") && (
                <StanderScanInputPanel
                  isCameraActive={isCameraActive}
                  isPreviewPending={previewMutation.isPending}
                  tokenInput={tokenInput}
                  videoRef={videoRef}
                  onManualSubmit={handleManualSubmit}
                  onStartCamera={startCamera}
                  onStopCamera={stopCamera}
                  onTokenInputChange={setTokenInput}
                />
              )}

              <StanderScanErrors
                cameraError={cameraError}
                previewError={step === "error" ? previewMutation.error : null}
                tokenError={tokenError}
              />

              {step === "preview" && preview && (
                <RedemptionPreviewPanel
                  canConfirm={canConfirm}
                  confirmError={confirmMutation.error}
                  isConfirmPending={confirmMutation.isPending}
                  preview={preview}
                  onCancel={handleReset}
                  onConfirm={() => {
                    if (currentRequest) confirmMutation.mutate(currentRequest);
                  }}
                />
              )}

              {step === "confirmed" && confirmedRedemption && (
                <RedemptionConfirmedPanel redemption={confirmedRedemption} onNext={handleReset} />
              )}
            </div>
          </div>
        </Container>
      </div>
    </RequireAuth>
  );
}
