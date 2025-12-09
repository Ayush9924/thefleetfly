import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function FuelLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fuel Logs</h1>
        <p className="text-gray-500">Track fuel consumption and costs</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fuel Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

