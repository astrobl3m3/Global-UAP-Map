import { useState, useEffect, useRef } from 'react'
import type { Observation, Location, MediaFile, SensorDataSnapshot } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Crosshair, Camera, VideoCamera, X, Play, Pause, Stop, Image as ImageIcon, Microphone, Gear, MapTrifold, TextColumns, MagnifyingGlass, Mountains } from '@phosphor-icons/react'
import { generateId, formatCoordinates } from '@/lib/helpers'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AudioPlayer } from '@/components/AudioPlayer'
import { LiveAudioSpectrum } from '@/components/LiveAudioSpectrum'
import { SensorDataSelector } from '@/components/SensorDataSelector'
import { MapView } from '@/components/MapView'
import { LocationSearch } from '@/components/LocationSearch'

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (observation: Observation) => void
}

export function ReportDialog({ open, onOpenChange, onSubmit }: ReportDialogProps) {
  const [location, setLocation] = useState<Location | null>(null)
  const [locationAccuracy, setLocationAccuracy] = useState<number>(0)
  const [altitude, setAltitude] = useState<number | undefined>(undefined)
  const [description, setDescription] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [photos, setPhotos] = useState<MediaFile[]>([])
  const [videos, setVideos] = useState<MediaFile[]>([])
  const [audioFiles, setAudioFiles] = useState<MediaFile[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isRecordingAudio, setIsRecordingAudio] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioRecordingTime, setAudioRecordingTime] = useState(0)
  const [audioQuality, setAudioQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [sensorData, setSensorData] = useState<SensorDataSnapshot | undefined>(undefined)
  const [isSensorCapturing, setIsSensorCapturing] = useState(false)
  const [locationMode, setLocationMode] = useState<'gps' | 'map' | 'manual' | 'search'>('gps')
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [mapCenter, setMapCenter] = useState<Location>({ lat: 20, lng: 0 })
  
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingIntervalRef = useRef<number | null>(null)
  const audioRecordingIntervalRef = useRef<number | null>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setLocation(newLocation)
        setMapCenter(newLocation)
        setLocationAccuracy(position.coords.accuracy)
        setAltitude(position.coords.altitude || undefined)
        setIsGettingLocation(false)
        setLocationMode('gps')
        toast.success('Location acquired')
      },
      (error) => {
        setIsGettingLocation(false)
        toast.error(`Location error: ${error.message}`)
      }
    )
  }

  const handleMapClick = async (clickedLocation: Location) => {
    setLocation(clickedLocation)
    setLocationAccuracy(0)
    setLocationMode('map')
    
    const { getElevation } = await import('@/lib/geocoding')
    const elevation = await getElevation(clickedLocation.lat, clickedLocation.lng)
    
    if (elevation !== null) {
      setAltitude(elevation)
      toast.success(`Location selected - Elevation: ${elevation}m`)
    } else {
      setAltitude(undefined)
      toast.success('Location selected on map')
    }
  }

  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates')
      return
    }

    if (lat < -90 || lat > 90) {
      toast.error('Latitude must be between -90 and 90')
      return
    }

    if (lng < -180 || lng > 180) {
      toast.error('Longitude must be between -180 and 180')
      return
    }

    const newLocation = { lat, lng }
    setLocation(newLocation)
    setMapCenter(newLocation)
    setLocationAccuracy(0)
    setAltitude(undefined)
    setLocationMode('manual')
    toast.success('Manual location set')
  }

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newPhotos: MediaFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const dataUrl = await fileToDataUrl(file)
      
      const photo: MediaFile = {
        id: generateId(),
        url: dataUrl,
        type: 'image',
        mimeType: file.type,
        sizeBytes: file.size,
        capturedAt: Date.now(),
        metadata: {
          deviceModel: navigator.userAgent,
        },
      }
      newPhotos.push(photo)
    }

    setPhotos((current) => [...current, ...newPhotos])
    toast.success(`Added ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''}`)
    
    if (photoInputRef.current) {
      photoInputRef.current.value = ''
    }
  }

  const handleVideoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const dataUrl = await fileToDataUrl(file)
    
    const video: MediaFile = {
      id: generateId(),
      url: dataUrl,
      type: 'video',
      mimeType: file.type,
      sizeBytes: file.size,
      capturedAt: Date.now(),
      metadata: {
        deviceModel: navigator.userAgent,
      },
    }

    setVideos((current) => [...current, video])
    toast.success('Video added')
    
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      videoStreamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const dataUrl = await blobToDataUrl(blob)
        
        const video: MediaFile = {
          id: generateId(),
          url: dataUrl,
          type: 'video',
          mimeType: 'video/webm',
          sizeBytes: blob.size,
          durationSeconds: recordingTime,
          capturedAt: Date.now(),
          metadata: {
            deviceModel: navigator.userAgent,
          },
        }

        setVideos((current) => [...current, video])
        toast.success('Video recording saved')
        
        if (videoStreamRef.current) {
          videoStreamRef.current.getTracks().forEach(track => track.stop())
          videoStreamRef.current = null
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)
      
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime((t) => t + 1)
      }, 1000)

      toast.success('Recording started')
    } catch (error) {
      toast.error('Camera access denied or unavailable')
    }
  }

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      })
      
      audioStreamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const dataUrl = await blobToDataUrl(blob)
        
        const audio: MediaFile = {
          id: generateId(),
          url: dataUrl,
          type: 'audio',
          mimeType: 'audio/webm',
          sizeBytes: blob.size,
          durationSeconds: audioRecordingTime,
          capturedAt: Date.now(),
          metadata: {
            deviceModel: navigator.userAgent,
          },
        }

        setAudioFiles((current) => [...current, audio])
        toast.success('Audio recording saved')
        
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop())
          audioStreamRef.current = null
        }
      }

      mediaRecorder.start()
      audioRecorderRef.current = mediaRecorder
      setIsRecordingAudio(true)
      setAudioRecordingTime(0)
      
      audioRecordingIntervalRef.current = window.setInterval(() => {
        setAudioRecordingTime((t) => t + 1)
      }, 1000)

      toast.success('Audio recording started')
    } catch (error) {
      toast.error('Microphone access denied or unavailable')
    }
  }

  const stopAudioRecording = () => {
    if (audioRecorderRef.current && isRecordingAudio) {
      audioRecorderRef.current.stop()
      setIsRecordingAudio(false)
      
      if (audioRecordingIntervalRef.current) {
        clearInterval(audioRecordingIntervalRef.current)
        audioRecordingIntervalRef.current = null
      }
    }
  }

  const removeAudio = (id: string) => {
    setAudioFiles((current) => current.filter((a) => a.id !== id))
  }

  const removePhoto = (id: string) => {
    setPhotos((current) => current.filter((p) => p.id !== id))
  }

  const removeVideo = (id: string) => {
    setVideos((current) => current.filter((v) => v.id !== id))
  }

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (!location) {
      toast.error('Please set a location')
      return
    }

    if (!description.trim()) {
      toast.error('Please add a description')
      return
    }

    if (isRecording || isRecordingAudio || isSensorCapturing) {
      toast.error('Please stop all recordings and sensor captures before submitting')
      return
    }

    const now = Date.now()
    
    let historicalWeather = undefined
    try {
      const { fetchHistoricalWeather } = await import('@/lib/elevation-service')
      const weatherData = await fetchHistoricalWeather(location, now)
      if (weatherData) {
        historicalWeather = {
          ...weatherData,
          fetchedAt: Date.now()
        }
      }
    } catch (error) {
      console.warn('Failed to fetch historical weather for observation', error)
    }
    
    const observation: Observation = {
      id: generateId(),
      userId: undefined,
      isAnonymous,
      observedAt: now,
      reportedAt: now,
      location,
      locationAccuracy,
      locationMethod: locationMode === 'gps' ? 'gps' : 'manual',
      altitude,
      title: description.trim().slice(0, 100),
      description: description.trim(),
      photos,
      videos,
      audio: audioFiles,
      sensorData,
      historicalWeather,
      communityClassifications: [],
      moderationStatus: 'approved',
      viewCount: 0,
      commentCount: 0,
      classificationCount: 0,
      visibility: 'public',
      reportVersion: '1.0',
      updatedAt: now,
    }

    onSubmit(observation)
    toast.success('Observation reported')
    
    setLocation(null)
    setLocationAccuracy(0)
    setAltitude(undefined)
    setDescription('')
    setIsAnonymous(false)
    setPhotos([])
    setVideos([])
    setAudioFiles([])
    setSensorData(undefined)
    setLocationMode('gps')
    setManualLat('')
    setManualLng('')
  }

  useEffect(() => {
    if (!open) {
      if (isRecording) {
        stopVideoRecording()
      }
      if (isRecordingAudio) {
        stopAudioRecording()
      }
      setLocation(null)
      setLocationAccuracy(0)
      setAltitude(undefined)
      setDescription('')
      setIsAnonymous(false)
      setPhotos([])
      setVideos([])
      setAudioFiles([])
      setRecordingTime(0)
      setAudioRecordingTime(0)
      setSensorData(undefined)
      setIsSensorCapturing(false)
      setLocationMode('gps')
      setManualLat('')
      setManualLng('')
      setMapCenter({ lat: 20, lng: 0 })
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (audioRecordingIntervalRef.current) {
        clearInterval(audioRecordingIntervalRef.current)
      }
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Report UAP Sighting</DialogTitle>
          <DialogDescription>
            Document your observation with location, media, and details
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="space-y-6 py-4 pr-4">
            <div className="space-y-3">
              <Label>Location</Label>
              <Tabs value={locationMode} onValueChange={(v) => setLocationMode(v as 'gps' | 'map' | 'manual' | 'search')} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="gps" className="gap-1.5">
                    <Crosshair size={16} weight="bold" />
                    GPS
                  </TabsTrigger>
                  <TabsTrigger value="map" className="gap-1.5">
                    <MapTrifold size={16} weight="bold" />
                    Map
                  </TabsTrigger>
                  <TabsTrigger value="search" className="gap-1.5">
                    <MagnifyingGlass size={16} weight="bold" />
                    Search
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="gap-1.5">
                    <TextColumns size={16} weight="bold" />
                    Manual
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="gps" className="space-y-3 mt-3">
                  <Button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    variant="outline"
                    className="gap-2 w-full"
                  >
                    <Crosshair size={18} weight="bold" />
                    {isGettingLocation ? 'Getting location...' : 'Use My Location'}
                  </Button>
                </TabsContent>

                <TabsContent value="search" className="space-y-3 mt-3">
                  <LocationSearch
                    onSelectLocation={(loc, elev, name) => {
                      setLocation(loc)
                      setMapCenter(loc)
                      setAltitude(elev)
                      setLocationAccuracy(0)
                      setLocationMode('search')
                    }}
                  />
                </TabsContent>

                <TabsContent value="map" className="space-y-3 mt-3">
                  <div className="border border-border rounded-lg overflow-hidden h-[300px]">
                    <MapView
                      observations={[]}
                      center={mapCenter}
                      zoom={location ? 13 : 3}
                      onMapClick={handleMapClick}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Click anywhere on the map to set location
                  </p>
                </TabsContent>

                <TabsContent value="manual" className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="manual-lat" className="text-xs">Latitude</Label>
                      <Input
                        id="manual-lat"
                        type="number"
                        step="any"
                        placeholder="e.g. 40.712776"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">-90 to 90</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manual-lng" className="text-xs">Longitude</Label>
                      <Input
                        id="manual-lng"
                        type="number"
                        step="any"
                        placeholder="e.g. -74.005974"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">-180 to 180</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleManualLocationSubmit}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <MapPin size={18} weight="bold" />
                    Set Location
                  </Button>
                </TabsContent>
              </Tabs>

              {location && (
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin size={18} weight="fill" className="mt-0.5 text-accent shrink-0" />
                    <div className="flex-1">
                      <p className="font-mono text-sm">{formatCoordinates(location.lat, location.lng)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        Set via: {locationMode}
                      </p>
                    </div>
                  </div>
                  
                  {(altitude !== undefined || locationAccuracy > 0) && (
                    <div className="flex gap-3 pt-2 border-t border-border/50">
                      {altitude !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <Mountains size={16} weight="fill" className="text-accent" />
                          <span className="text-xs font-medium">
                            {altitude.toFixed(0)}m
                          </span>
                          <span className="text-xs text-muted-foreground">elevation</span>
                        </div>
                      )}
                      {locationAccuracy > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">
                            ±{locationAccuracy.toFixed(0)}m accuracy
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Photos & Videos</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Camera size={18} weight="bold" />
                  Add Photos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <ImageIcon size={18} weight="bold" />
                  Add Video
                </Button>
                {!isRecording ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 col-span-2"
                    onClick={startVideoRecording}
                  >
                    <VideoCamera size={18} weight="bold" />
                    Record Video
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    className="gap-2 col-span-2"
                    onClick={stopVideoRecording}
                  >
                    <Stop size={18} weight="fill" />
                    Stop Recording ({formatRecordingTime(recordingTime)})
                  </Button>
                )}
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={handleVideoCapture}
              />

              {photos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Photos ({photos.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square">
                        <img
                          src={photo.url}
                          alt="Captured"
                          className="w-full h-full object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {videos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Videos ({videos.length})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {videos.map((video) => (
                      <div key={video.id} className="relative group aspect-video">
                        <video
                          src={video.url}
                          className="w-full h-full object-cover rounded-lg border border-border"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo(video.id)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Audio Recording</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="h-7 gap-1.5">
                      <Gear size={14} weight="bold" />
                      <span className="text-xs">Quality: {audioQuality}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Recording Quality</h4>
                      <Select value={audioQuality} onValueChange={(v) => setAudioQuality(v as 'low' | 'medium' | 'high')}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (32 kbps)</SelectItem>
                          <SelectItem value="medium">Medium (64 kbps)</SelectItem>
                          <SelectItem value="high">High (128 kbps)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Higher quality = larger file size
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {!isRecordingAudio ? (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 w-full"
                  onClick={startAudioRecording}
                >
                  <Microphone size={18} weight="bold" />
                  Record Audio
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    className="gap-2 w-full"
                    onClick={stopAudioRecording}
                  >
                    <Stop size={18} weight="fill" />
                    Stop Recording ({formatRecordingTime(audioRecordingTime)})
                  </Button>
                  <LiveAudioSpectrum 
                    stream={audioStreamRef.current} 
                    isActive={isRecordingAudio} 
                  />
                </>
              )}

              {audioFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Audio Recordings ({audioFiles.length})</p>
                  <div className="space-y-2">
                    {audioFiles.map((audio) => (
                      <AudioPlayer
                        key={audio.id}
                        audio={audio}
                        onRemove={removeAudio}
                        showRemoveButton={true}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <SensorDataSelector
              onDataCaptured={setSensorData}
              onDataCleared={() => setSensorData(undefined)}
              isCapturing={isSensorCapturing}
              onCapturingChange={setIsSensorCapturing}
            />

            <div className="space-y-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed in detail... Include time of day, duration, movement patterns, size, color, sounds, etc."
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {description.length} characters
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous">Anonymous Report</Label>
                <p className="text-sm text-muted-foreground">
                  Post without identifying information
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={isRecording || isRecordingAudio || isSensorCapturing}
          >
            Submit Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
