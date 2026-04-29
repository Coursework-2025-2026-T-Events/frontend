import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { useMutation } from "@tanstack/react-query";
import { rewardApi, type RedemptionTokenRequest } from "@/features/reward/api";
import type { RedemptionPreviewDTO, RewardRedemptionDTO } from "@/lib/api/types";
import { extractSignedToken } from "@/lib/qrToken";
import { buildManualRedemptionRequest, buildQrRedemptionRequest, type StanderScanStep } from "./standerScan";

function vibrate(pattern: VibratePattern): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function useStanderScanPage() {
  const [step, setStep] = useState<StanderScanStep>("scan");
  const [tokenInput, setTokenInput] = useState("");
  const [preview, setPreview] = useState<RedemptionPreviewDTO | null>(null);
  const [confirmedRedemption, setConfirmedRedemption] = useState<RewardRedemptionDTO | null>(null);
  const [currentRequest, setCurrentRequest] = useState<RedemptionTokenRequest | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);
  const loadedUrlTokenRef = useRef(false);

  const stopCamera = useCallback(() => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setIsCameraActive(false);
  }, []);

  const previewMutation = useMutation({
    mutationFn: (payload: RedemptionTokenRequest) => rewardApi.previewRedemption(payload),
    onSuccess: (res) => {
      vibrate(40);
      setPreview(res.data);
      setStep("preview");
      stopCamera();
    },
    onError: () => {
      vibrate([40, 30, 40]);
      setStep("error");
      stopCamera();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (payload: RedemptionTokenRequest) => rewardApi.confirmRedemption(payload),
    onSuccess: (res) => {
      vibrate([40, 30, 80]);
      setConfirmedRedemption(res.data);
      setStep("confirmed");
      setCurrentRequest(null);
      setTokenInput("");
      stopCamera();
    },
  });

  const submitQrPayload = useCallback(
    (payload: string) => {
      const request = buildQrRedemptionRequest(payload);
      if (!request) {
        setTokenError("QR-код не содержит токен выдачи.");
        return;
      }

      setTokenError(null);
      setCurrentRequest(request);
      setPreview(null);
      setConfirmedRedemption(null);
      setStep("scan");
      confirmMutation.reset();
      previewMutation.mutate(request);
    },
    [confirmMutation, previewMutation],
  );

  const submitManualRedeemCode = useCallback(
    (code: string) => {
      const request = buildManualRedemptionRequest(code);
      if (!request) {
        setTokenError("Введите ручной код выдачи, например A7C3-42K9.");
        return;
      }

      setTokenError(null);
      setCurrentRequest(request);
      setPreview(null);
      setConfirmedRedemption(null);
      setStep("scan");
      confirmMutation.reset();
      previewMutation.mutate(request);
    },
    [confirmMutation, previewMutation],
  );

  const startCamera = async () => {
    setCameraError(null);
    setTokenError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Браузер не поддерживает доступ к камере. Введите ручной код выдачи.");
      return;
    }

    if (!videoRef.current) return;

    try {
      stopCamera();
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        const text = result?.getText();
        if (!text || previewMutation.isPending) return;
        scannerControlsRef.current?.stop();
        submitQrPayload(text);
      });
      scannerControlsRef.current = controls;
      setIsCameraActive(true);
    } catch {
      setCameraError("Не удалось запустить камеру. Проверьте разрешения браузера или введите ручной код выдачи.");
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (loadedUrlTokenRef.current) return;
    loadedUrlTokenRef.current = true;
    const tokenFromUrl = extractSignedToken(window.location.href);
    if (tokenFromUrl) {
      window.setTimeout(() => submitQrPayload(window.location.href), 0);
    }

    return () => stopCamera();
  }, [stopCamera, submitQrPayload]);

  const handleManualSubmit = () => submitManualRedeemCode(tokenInput);

  const handleReset = () => {
    stopCamera();
    setStep("scan");
    setTokenInput("");
    setPreview(null);
    setConfirmedRedemption(null);
    setCurrentRequest(null);
    setCameraError(null);
    setTokenError(null);
    previewMutation.reset();
    confirmMutation.reset();
  };

  const canConfirm = Boolean(currentRequest) && preview?.qr_status === "active" && !preview.already_redeemed;

  return {
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
  };
}
