'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import type { Pin } from '@/lib/supabase/types'
import PinForm from './PinForm'
import { useToast, ToastContainer } from '@/components/ui/Toast'

interface PendingPin {
  x_percent: number
  y_percent: number
}

interface PinEditorProps {
  fitId: string
  imageUrl: string
  initialPins: Pin[]
}

export default function PinEditor({ fitId, imageUrl, initialPins }: PinEditorProps) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const imageRef = useRef<HTMLDivElement>(null)

  const [pins, setPins] = useState<Pin[]>(initialPins)
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null)
  const [editingPinId, setEditingPinId] = useState<string | null>(null)

  const createPin = useMutation({
    mutationFn: async (data: Omit<Pin, 'id' | 'created_at'>) => {
      const res = await fetch('/api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Failed to create pin')
      return json.data as Pin
    },
    onSuccess: (pin) => {
      setPins((prev) => [...prev, pin])
      setPendingPin(null)
      queryClient.invalidateQueries({ queryKey: ['pins', fitId] })
      toast.success('Pin added')
    },
    onError: (err) => toast.error(err.message),
  })

  const updatePin = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pin> }) => {
      const res = await fetch(`/api/pins/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Failed to update pin')
      return json.data as Pin
    },
    onSuccess: (pin) => {
      setPins((prev) => prev.map((p) => (p.id === pin.id ? pin : p)))
      setEditingPinId(null)
      queryClient.invalidateQueries({ queryKey: ['pins', fitId] })
      toast.success('Pin updated')
    },
    onError: (err) => toast.error(err.message),
  })

  const deletePin = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/pins/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Failed to delete pin')
      return id
    },
    onSuccess: (id) => {
      setPins((prev) => prev.filter((p) => p.id !== id))
      setEditingPinId(null)
      queryClient.invalidateQueries({ queryKey: ['pins', fitId] })
      toast.success('Pin removed')
    },
    onError: (err) => toast.error(err.message),
  })

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (editingPinId) {
        setEditingPinId(null)
        return
      }
      const rect = imageRef.current?.getBoundingClientRect()
      if (!rect) return
      const x_percent = ((e.clientX - rect.left) / rect.width) * 100
      const y_percent = ((e.clientY - rect.top) / rect.height) * 100
      setPendingPin({ x_percent, y_percent })
    },
    [editingPinId]
  )

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Image with pins */}
        <div
          ref={imageRef}
          className="relative rounded-xl overflow-hidden border border-outline-variant cursor-crosshair bg-surface-container-low flex-shrink-0"
          style={{ width: '100%', maxWidth: 480, aspectRatio: '3/4' }}
          onClick={handleImageClick}
        >
          <Image
            src={imageUrl}
            alt="Outfit"
            fill
            sizes="480px"
            className="object-cover pointer-events-none"
            priority
          />

          {/* Existing pins */}
          <AnimatePresence>
            {pins.map((pin) => (
              <motion.button
                key={pin.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="absolute w-6 h-6 rounded-full border-2 border-white/80 cursor-pointer z-10 pin-pulse"
                style={{
                  left: `${pin.x_percent}%`,
                  top: `${pin.y_percent}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: editingPinId === pin.id ? '#fff' : '#E8C068',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingPinId(editingPinId === pin.id ? null : pin.id)
                  setPendingPin(null)
                }}
                aria-label={`Edit pin: ${pin.product_name}`}
              />
            ))}
          </AnimatePresence>

          {/* Pending pin (not yet saved) */}
          {pendingPin && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute w-6 h-6 rounded-full bg-white/80 border-2 border-secondary z-10 pointer-events-none"
              style={{
                left: `${pendingPin.x_percent}%`,
                top: `${pendingPin.y_percent}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}

          {/* Hint */}
          {pins.length === 0 && !pendingPin && (
            <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
              <p className="text-xs text-white/70 bg-black/50 px-3 py-1.5 rounded-full">
                Click anywhere on the image to add a pin
              </p>
            </div>
          )}
        </div>

        {/* Side panel: pending pin form or editing pin form */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {pendingPin && (
              <motion.div
                key="new-pin"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <PinForm
                  onSave={(data) =>
                    createPin.mutate({
                      fit_id: fitId,
                      x_percent: pendingPin.x_percent,
                      y_percent: pendingPin.y_percent,
                      product_name: data.product_name,
                      brand: data.brand ?? null,
                      price: data.price ?? null,
                      affiliate_url: data.affiliate_url,
                    })
                  }
                  onCancel={() => setPendingPin(null)}
                  isLoading={createPin.isPending}
                />
              </motion.div>
            )}

            {editingPinId && (
              <motion.div
                key={`edit-${editingPinId}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <PinForm
                  pin={pins.find((p) => p.id === editingPinId)}
                  onSave={(data) => updatePin.mutate({ id: editingPinId, data })}
                  onCancel={() => setEditingPinId(null)}
                  isLoading={updatePin.isPending}
                />
                <button
                  onClick={() => deletePin.mutate(editingPinId)}
                  className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Delete this pin
                </button>
              </motion.div>
            )}

            {!pendingPin && !editingPinId && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-on-surface-variant text-sm"
              >
                <p className="font-medium text-on-surface mb-1">
                  {pins.length} pin{pins.length !== 1 ? 's' : ''} placed
                </p>
                <p>Click on the image to add a pin. Click an existing pin to edit it.</p>
                <div className="mt-4 flex flex-col gap-2">
                  {pins.map((pin) => (
                    <button
                      key={pin.id}
                      onClick={() => setEditingPinId(pin.id)}
                      className="flex items-center justify-between p-2.5 bg-surface-container-low border border-outline-variant rounded-lg
                        hover:border-secondary transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-on-surface">{pin.product_name}</p>
                        {pin.brand && <p className="text-xs text-on-surface-variant">{pin.brand}</p>}
                      </div>
                      {pin.price != null && (
                        <p className="text-xs text-secondary">₹{pin.price.toLocaleString('en-IN')}</p>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </>
  )
}
