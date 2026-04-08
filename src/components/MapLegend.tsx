import { Card } from '@/components/ui/card'
import { EXTERNAL_DATA_SOURCES } from '@/lib/external-sources'
import { Circle, User } from '@phosphor-icons/react'

interface MapLegendProps {
  showUserReports?: boolean
  showExternalData?: boolean
}

export function MapLegend({ showUserReports = true, showExternalData = true }: MapLegendProps) {
  return (
    <Card className="absolute bottom-4 left-4 z-[1000] p-3 bg-card/95 backdrop-blur-sm border-border shadow-lg">
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-foreground mb-2">Data Sources</h3>
        
        {showUserReports && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'oklch(0.75 0.15 200)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgb(20, 25, 40)' }}></div>
            </div>
            <div className="flex items-center gap-1">
              <User size={14} weight="fill" className="text-accent" />
              <span className="text-muted-foreground">User Reports</span>
            </div>
          </div>
        )}

        {showExternalData && EXTERNAL_DATA_SOURCES.filter(s => s.enabled).map((source) => (
          <div key={source.id} className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: source.color }}>
              <Circle size={6} weight="fill" className="text-white" />
            </div>
            <a 
              href={source.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors underline decoration-dotted"
            >
              {source.name}
            </a>
          </div>
        ))}
      </div>
    </Card>
  )
}
