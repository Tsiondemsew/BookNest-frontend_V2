'use client';

import { useEffect, useRef, useCallback } from 'react';

interface EncryptionRequest {
  id: string;
  action: 'encrypt' | 'decrypt' | 'generateKey';
  payload?: {
    data?: ArrayBuffer | string;
    key?: string;
    nonce?: string;
  };
}

interface EncryptionResponse {
  id: string;
  success: boolean;
  result?: ArrayBuffer | string | object;
  error?: string;
}

/**
 * useEncryptionWorker - Hook to interact with encryption Web Worker
 * 
 * Offloads encryption/decryption to a separate thread to avoid blocking the UI.
 * 
 * Usage:
 * const { encrypt, decrypt, generateKey, isReady } = useEncryptionWorker();
 * 
 * const encrypted = await encrypt(data);
 */
export function useEncryptionWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<
    Map<string, (response: EncryptionResponse) => void>
  >(new Map());
  const isReadyRef = useRef(false);

  // Initialize worker
  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined' || !window.Worker) {
      console.warn('Web Workers not supported');
      return;
    }

    try {
      // Create worker from public/workers/encryption.worker.ts
      // NextJS will bundle this for us
      workerRef.current = new Worker('/workers/encryption.worker.js', {
        type: 'module',
      });

      // Handle messages from worker
      workerRef.current.onmessage = (event: MessageEvent<EncryptionResponse>) => {
        const { type, id, success, result, error } = event.data;

        // Handle ready message
        if (type === 'ready') {
          isReadyRef.current = true;
          return;
        }

        // Handle encryption/decryption responses
        if (id && pendingRef.current.has(id)) {
          const callback = pendingRef.current.get(id);
          pendingRef.current.delete(id);

          if (callback) {
            callback({ id, success, result, error });
          }
        }
      };

      // Handle worker errors
      workerRef.current.onerror = (error) => {
        console.error('[EncryptionWorker] Error:', error);
      };
    } catch (error) {
      console.error('[EncryptionWorker] Failed to create worker:', error);
    }

    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Send message to worker and wait for response
  const sendMessage = useCallback(
    (message: EncryptionRequest): Promise<EncryptionResponse> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'));
          return;
        }

        const id = message.id || 'req-' + Date.now() + '-' + Math.random();

        // Set up response handler
        pendingRef.current.set(id, (response) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error));
          }
        });

        // Send message with ID
        workerRef.current.postMessage({ ...message, id });

        // Timeout after 30 seconds
        setTimeout(() => {
          if (pendingRef.current.has(id)) {
            pendingRef.current.delete(id);
            reject(new Error('Worker request timeout'));
          }
        }, 30000);
      });
    },
    []
  );

  // Encrypt data
  const encrypt = useCallback(
    async (
      data: ArrayBuffer | string,
      key?: string,
      nonce?: string
    ): Promise<object> => {
      const response = await sendMessage({
        id: 'encrypt-' + Date.now(),
        action: 'encrypt',
        payload: { data, key, nonce },
      });

      return response.result || {};
    },
    [sendMessage]
  );

  // Decrypt data
  const decrypt = useCallback(
    async (
      data: ArrayBuffer | string,
      key?: string,
      nonce?: string
    ): Promise<ArrayBuffer | string> => {
      const response = await sendMessage({
        id: 'decrypt-' + Date.now(),
        action: 'decrypt',
        payload: { data, key, nonce },
      });

      return response.result as ArrayBuffer | string;
    },
    [sendMessage]
  );

  // Generate encryption key
  const generateKey = useCallback(async (): Promise<object> => {
    const response = await sendMessage({
      id: 'generateKey-' + Date.now(),
      action: 'generateKey',
    });

    return response.result || {};
  }, [sendMessage]);

  return {
    encrypt,
    decrypt,
    generateKey,
    isReady: isReadyRef.current,
  };
}
